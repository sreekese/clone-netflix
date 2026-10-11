import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useDispatch } from 'react-redux';
import Header from './Header';
import { auth } from '../utlis/firebase';
import { addUser } from '../utlis/userSlice';
import { setCreatingAccount, setSessionNotice } from '../utlis/sessionSlice';
import { authErrorMessage, checkValidateForm } from '../utlis/validate';

export default function Login() {
  const [params, setParams] = useSearchParams();
  const isSignUp = params.get('mode') === 'signup';
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const values = new FormData(event.currentTarget);
    const email = values.get('email').trim();
    const password = values.get('password');
    const name = values.get('name') || '';
    const message = checkValidateForm(email, password, isSignUp, name);
    if (message) {
      setError(message);
      return;
    }
    if (!auth) {
      setError(
        'Authentication is not configured. Follow the setup instructions in README.md.',
      );
      return;
    }
    setError('');
    setBusy(true);
    if (isSignUp) dispatch(setCreatingAccount(true));
    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        let displayName = name.trim();
        try {
          await updateProfile(user, { displayName });
        } catch {
          displayName = user.displayName || null;
          dispatch(
            setSessionNotice(
              'Your account was created, but your display name could not be saved.',
            ),
          );
        }
        dispatch(addUser({ uid: user.uid, email: user.email, displayName }));
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
      dispatch(setCreatingAccount(false));
    }
  }
  return (
    <div className="welcome-page">
      <Header />
      <main className="auth-main">
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={isSignUp ? 'Sign up' : 'Sign in'}
        >
          <h1>{isSignUp ? 'Create an account' : 'Sign in'}</h1>
          <p className="muted">Your next favorite movie is waiting.</p>
          <fieldset disabled={busy}>
            {isSignUp && (
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                aria-describedby={isSignUp ? 'password-hint' : undefined}
              />
            </label>
            {isSignUp && (
              <p id="password-hint" className="muted">
                Use at least 8 characters.
              </p>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button full" type="submit">
              {busy ? 'Please wait…' : isSignUp ? 'Sign up' : 'Sign in'}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setParams(isSignUp ? {} : { mode: 'signup' });
                setError('');
              }}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : 'New here? Create an account'}
            </button>
          </fieldset>
        </form>
      </main>
    </div>
  );
}
