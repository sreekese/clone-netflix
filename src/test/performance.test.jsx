import { act, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, expect, it, vi } from 'vitest';
import { cachedRequest, clearMovieCache } from '../services/requestCache';
import MovieCategory from '../component/MovieCategory';
import MainContainer from '../component/MainContainer';
import { createAppStore } from '../utlis/appStore';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('deduplicates concurrent requests and caches completed data until expiry', async () => {
  vi.useFakeTimers();
  const loader = vi.fn().mockResolvedValue(['movie']);
  expect(
    await Promise.all([
      cachedRequest('movies', loader),
      cachedRequest('movies', loader),
    ]),
  ).toEqual([['movie'], ['movie']]);
  await cachedRequest('movies', loader);
  expect(loader).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(300001);
  await cachedRequest('movies', loader);
  expect(loader).toHaveBeenCalledTimes(2);
});

it('does not cancel a shared request when only one consumer leaves', async () => {
  let finish;
  let sharedSignal;
  const loader = vi.fn((signal) => {
    sharedSignal = signal;
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const first = new AbortController();
  const second = new AbortController();
  const one = cachedRequest('shared', loader, first.signal);
  const two = cachedRequest('shared', loader, second.signal);
  first.abort();
  await expect(one).rejects.toMatchObject({ name: 'AbortError' });
  expect(sharedSignal.aborted).toBe(false);
  finish('done');
  await expect(two).resolves.toBe('done');
  expect(loader).toHaveBeenCalledOnce();
});

it('does not cache failures or abandoned responses', async () => {
  const failed = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce('recovered');
  await expect(cachedRequest('failure', failed)).rejects.toThrow('offline');
  await expect(cachedRequest('failure', failed)).resolves.toBe('recovered');
  let finish;
  const controller = new AbortController();
  const loader = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce('fresh');
  const promise = cachedRequest('abandoned', loader, controller.signal);
  controller.abort();
  await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  finish('stale');
  await Promise.resolve();
  await expect(cachedRequest('abandoned', loader)).resolves.toBe('fresh');
});

it('bounds the cache and allows explicit clearing', async () => {
  const loader = vi.fn().mockResolvedValue('data');
  for (let index = 0; index < 101; index++)
    await cachedRequest(String(index), loader);
  await cachedRequest('0', loader);
  expect(loader).toHaveBeenCalledTimes(102);
  clearMovieCache();
  await cachedRequest('0', loader);
  expect(loader).toHaveBeenCalledTimes(103);
  const controller = new AbortController();
  controller.abort();
  await expect(
    cachedRequest('0', loader, controller.signal),
  ).rejects.toMatchObject({ name: 'AbortError' });
});

function observeVisibility() {
  const observers = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );
  return observers;
}

it('defers category requests until they approach the viewport', async () => {
  const observers = observeVisibility();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ id: 1, title: 'Arrival' }] }),
    }),
  );
  render(
    <MovieCategory title="Popular" path="/movie/popular" onSelect={vi.fn()} />,
  );
  expect(fetch).not.toHaveBeenCalled();
  act(() => observers[0].callback([{ isIntersecting: true }]));
  expect(
    await screen.findByRole('button', { name: 'View Arrival' }),
  ).toBeInTheDocument();
  expect(observers[0].disconnect).toHaveBeenCalled();
});

it('suspends banner video offscreen and in a hidden tab', async () => {
  const observers = observeVisibility();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ site: 'YouTube', type: 'Trailer', key: 'abc' }],
      }),
    }),
  );
  const store = createAppStore({
    movies: {
      nowPlayingMovies: [{ id: 1, title: 'Arrival' }],
      nowPlayingError: null,
    },
  });
  render(
    <Provider store={store}>
      <MainContainer onSelect={vi.fn()} />
    </Provider>,
  );
  expect(screen.queryByTitle('Arrival banner trailer')).not.toBeInTheDocument();
  act(() => observers[0].callback([{ isIntersecting: true }]));
  expect(
    await screen.findByTitle('Arrival banner trailer'),
  ).toBeInTheDocument();
  act(() => observers[0].callback([{ isIntersecting: false }]));
  expect(screen.queryByTitle('Arrival banner trailer')).not.toBeInTheDocument();
  act(() => observers[0].callback([{ isIntersecting: true }]));
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(screen.queryByTitle('Arrival banner trailer')).not.toBeInTheDocument();
  hidden.mockReturnValue(false);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  await waitFor(() =>
    expect(screen.getByTitle('Arrival banner trailer')).toBeInTheDocument(),
  );
  expect(fetch).toHaveBeenCalledOnce();
});
