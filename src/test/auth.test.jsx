import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { createAppStore } from '../utlis/appStore';
import { checkValidateForm, authErrorMessage } from '../utlis/validate';
import Login from '../component/Login';
import Header from '../component/Header';
import Body, { AppRoutes } from '../component/Body';

vi.mock('../utlis/firebase', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));
vi.mock('../component/Browse', () => ({
  default: () => <h1>Movie catalog</h1>,
}));

function renderWithStore(element, path = '/login', state) {
  const store = createAppStore(state);
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
      </Provider>,
    ),
  };
}
async function fillLogin(user) {
  await user.type(screen.getByLabelText('Email address'), 'viewer@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
}

describe('validation', () => {
  it.each(['a+b@example.technology', ' person@example.com '])(
    'accepts valid email %s',
    (email) => {
      expect(checkValidateForm(email, 'existing')).toBeNull();
    },
  );
  it('validates sign-up without blocking existing shorter passwords at sign-in', () => {
    expect(checkValidateForm('bad', 'abc')).toMatch(/email/);
    expect(checkValidateForm('a@b.com', '')).toMatch(/password/);
    expect(checkValidateForm('a@b.com', 'abc')).toBeNull();
    expect(checkValidateForm('a@b.com', 'longpassword', true, ' ')).toMatch(
      /name/,
    );
    expect(checkValidateForm('a@b.com', 'short', true, 'Name')).toMatch(
      /8 characters/,
    );
  });
  it('does not expose raw provider errors', () => {
    expect(
      authErrorMessage({ code: 'unknown', message: 'internal detail' }),
    ).not.toContain('internal detail');
  });
});

describe('authentication form', () => {
  it('submits sign-in from the keyboard', async () => {
    signInWithEmailAndPassword.mockResolvedValue({});
    const user = userEvent.setup();
    renderWithStore(<Login />);
    await fillLogin(user);
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        'viewer@example.com',
        'password123',
      ),
    );
  });
  it('prevents invalid submissions', async () => {
    renderWithStore(<Login />);
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('valid email');
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });
  it('shows friendly errors and re-enables submission', async () => {
    signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/invalid-credential',
    });
    const user = userEvent.setup();
    renderWithStore(<Login />);
    await fillLogin(user);
    await user.click(
      screen.getByRole('button', { name: 'Sign in', exact: true }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Incorrect email or password',
    );
    expect(
      screen.getByRole('button', { name: 'Sign in', exact: true }),
    ).toBeEnabled();
  });
  it('creates a profile and updates user state', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'user-1', email: 'viewer@example.com' },
    });
    updateProfile.mockResolvedValue();
    const user = userEvent.setup();
    const { store } = renderWithStore(<Login />, '/login?mode=signup');
    await user.type(screen.getByLabelText('Full name'), '  Viewer  ');
    await fillLogin(user);
    await user.click(
      screen.getByRole('button', { name: 'Sign up', exact: true }),
    );
    await waitFor(() =>
      expect(store.getState().user?.displayName).toBe('Viewer'),
    );
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'user-1' }),
      { displayName: 'Viewer' },
    );
  });
  it('preserves a created account when saving its display name fails', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'user-1', email: 'viewer@example.com' },
    });
    updateProfile.mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    const { store } = renderWithStore(<Login />, '/login?mode=signup');
    await user.type(screen.getByLabelText('Full name'), 'Viewer');
    await fillLogin(user);
    await user.click(
      screen.getByRole('button', { name: 'Sign up', exact: true }),
    );
    await waitFor(() =>
      expect(store.getState().session.notice).toContain('account was created'),
    );
    expect(store.getState().user.uid).toBe('user-1');
    expect(store.getState().session.creatingAccount).toBe(false);
  });
  it('switches authentication modes and clears validation errors', async () => {
    const user = userEvent.setup();
    renderWithStore(<Login />);
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Create an account/ }));
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('disables controls while authentication is pending', async () => {
    let finish;
    signInWithEmailAndPassword.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const user = userEvent.setup();
    renderWithStore(<Login />);
    await fillLogin(user);
    await user.click(
      screen.getByRole('button', { name: 'Sign in', exact: true }),
    );
    expect(screen.getByLabelText('Email address')).toBeDisabled();
    await act(async () => finish({}));
  });
});

describe('session and routing', () => {
  it('keeps registration visible until profile creation finishes', () => {
    renderWithStore(<AppRoutes />, '/login?mode=signup', {
      user: { uid: '1' },
      session: { creatingAccount: true, notice: '' },
    });
    expect(screen.getByRole('form', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.queryByText('Movie catalog')).not.toBeInTheDocument();
  });
  it('shows the landing page and a working registration link', () => {
    renderWithStore(<AppRoutes />, '/');
    expect(screen.getByRole('link', { name: /Get started/ })).toHaveAttribute(
      'href',
      '/login?mode=signup',
    );
  });

  it('protects browse from unauthenticated visitors', () => {
    renderWithStore(<AppRoutes />, '/browse');
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByText('Movie catalog')).not.toBeInTheDocument();
  });
  it('redirects authenticated visitors to browse', () => {
    renderWithStore(<AppRoutes />, '/login', { user: { uid: '1' } });
    expect(screen.getByText('Movie catalog')).toBeInTheDocument();
  });
  it('restores sessions and unsubscribes on unmount', async () => {
    let listener;
    const unsubscribe = vi.fn();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      listener = callback;
      return unsubscribe;
    });
    const store = createAppStore();
    const { unmount } = render(
      <Provider store={store}>
        <Body />
      </Provider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your session',
    );
    act(() => listener({ uid: '1', email: 'a@b.com', displayName: 'Viewer' }));
    expect(await screen.findByText('Movie catalog')).toBeInTheDocument();
    expect(store.getState().user.uid).toBe('1');
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
  it('uses an avatar menu without exposing the email in the header', async () => {
    const user = userEvent.setup();
    renderWithStore(<Header overlay />, '/browse', {
      user: { uid: '1', email: 'viewer@example.com' },
    });
    expect(screen.queryByText('viewer@example.com')).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('header-overlay');
    const button = screen.getByRole('button', { name: 'Open profile menu' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'My profile' })).toHaveAttribute(
      'href',
      '/profile',
    );
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });
  it('protects direct movie URLs from unauthenticated visitors', () => {
    renderWithStore(<AppRoutes />, '/movie/123');
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
  });
  it('shows account information on the profile page', () => {
    renderWithStore(<AppRoutes />, '/profile', {
      user: { uid: '1', email: 'viewer@example.com', displayName: 'Viewer' },
    });
    expect(
      screen.getByRole('heading', { name: 'My profile' }),
    ).toBeInTheDocument();
    expect(screen.getByText('viewer@example.com')).toBeInTheDocument();
  });
  it('keeps users on the page when sign-out fails', async () => {
    signOut.mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    renderWithStore(<Header />, '/browse', {
      user: { uid: '1', displayName: 'Viewer' },
    });
    await user.click(screen.getByRole('button', { name: 'Open profile menu' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to sign out',
    );
  });
});
