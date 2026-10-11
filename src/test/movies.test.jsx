import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, it, expect, vi } from 'vitest';
import { fetchMovieData, selectTrailer } from '../services/movies';
import useMovieTrailer from '../hook/useMovieTrailer';
import useNowPlaying from '../hook/useNowPlaying';
import { createAppStore } from '../utlis/appStore';
import { addNowPlayingMovies } from '../utlis/moviesSlice';
import { removeUser } from '../utlis/userSlice';

const video = {
  site: 'YouTube',
  type: 'Trailer',
  key: 'abc123',
  official: true,
};
const response = (results) => ({ ok: true, json: async () => ({ results }) });

describe('movie service', () => {
  it('rejects unsuccessful and malformed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }),
    );
    await expect(fetchMovieData('/movie/now_playing')).rejects.toThrow(
      'Unable to load',
    );
    await expect(fetchMovieData('/movie/now_playing')).rejects.toThrow(
      'invalid response',
    );
  });
  it('prefers official YouTube trailers and ignores unsupported or unsafe videos', () => {
    expect(
      selectTrailer([{ ...video, official: false, key: 'other' }, video]),
    ).toEqual(video);
    expect(
      selectTrailer([
        { ...video, site: 'Vimeo' },
        { ...video, key: 'bad?key' },
      ]),
    ).toBeNull();
    expect(selectTrailer([{ ...video, type: 'Teaser' }])?.type).toBe('Teaser');
    expect(selectTrailer([{ ...video, type: 'Clip' }])).toBeNull();
  });
});

describe('useMovieTrailer', () => {
  it('loads a supported trailer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([video])));
    const { result } = renderHook(() => useMovieTrailer(1));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.trailer).toEqual(video));
    expect(result.current.loading).toBe(false);
  });
  it('handles missing IDs, empty results and errors', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response([]))
      .mockRejectedValueOnce(new Error('offline'));
    vi.stubGlobal('fetch', fetch);
    const { result, rerender } = renderHook(({ id }) => useMovieTrailer(id), {
      initialProps: { id: null },
    });
    expect(fetch).not.toHaveBeenCalled();
    rerender({ id: 1 });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.trailer).toBeNull();
    rerender({ id: 2 });
    await waitFor(() =>
      expect(result.current.error).toContain('could not be loaded'),
    );
  });
  it('aborts outdated requests and ignores late responses', async () => {
    let resolveFirst;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(response([{ ...video, key: 'new' }]));
    vi.stubGlobal('fetch', fetch);
    const { result, rerender, unmount } = renderHook(
      ({ id }) => useMovieTrailer(id),
      { initialProps: { id: 1 } },
    );
    rerender({ id: 2 });
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    await waitFor(() => expect(result.current.trailer?.key).toBe('new'));
    await act(async () => {
      resolveFirst(response([video]));
    });
    expect(result.current.trailer.key).toBe('new');
    unmount();
    expect(fetch.mock.calls[1][1].signal.aborted).toBe(true);
  });
});

describe('movie state', () => {
  it('loads now-playing movies and clears user data on sign-out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(response([{ id: 1, title: 'Movie' }])),
    );
    const store = createAppStore();
    renderHook(() => useNowPlaying(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    await waitFor(() =>
      expect(store.getState().movies.nowPlayingMovies).toHaveLength(1),
    );
    act(() => {
      store.dispatch(removeUser());
    });
    expect(store.getState().movies.nowPlayingMovies).toBeNull();
  });
  it('exposes failures and supports retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new Error('Offline'))
        .mockResolvedValueOnce(response([])),
    );
    const store = createAppStore();
    const { rerender } = renderHook(({ retry }) => useNowPlaying(retry), {
      initialProps: { retry: 0 },
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    await waitFor(() =>
      expect(store.getState().movies.nowPlayingError).toBe('Offline'),
    );
    rerender({ retry: 1 });
    await waitFor(() =>
      expect(store.getState().movies.nowPlayingMovies).toEqual([]),
    );
    expect(store.getState().movies.nowPlayingError).toBeNull();
  });
  it('isolates store instances', () => {
    const first = createAppStore();
    first.dispatch(addNowPlayingMovies([{ id: 1 }]));
    expect(createAppStore().getState().movies.nowPlayingMovies).toBeNull();
  });
});
