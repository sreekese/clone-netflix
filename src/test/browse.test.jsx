import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { createAppStore } from '../utlis/appStore';
import Browse from '../component/Browse';
import MovieCard from '../component/MovieCard';
import MovieDetails from '../component/MovieDetails';
import MoviePage from '../component/MoviePage';
import MovieCategory from '../component/MovieCategory';
import MainContainer from '../component/MainContainer';

vi.mock('../utlis/firebase', () => ({ auth: {} }));
const movie = {
  id: 1,
  title: 'Arrival',
  overview: 'A visitor from another world.',
  vote_average: 8.1,
  release_date: '2016-11-01',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
};
const sequel = { ...movie, id: 2, title: 'Interstellar' };
const third = { ...movie, id: 3, title: 'Dune' };
const video = { site: 'YouTube', type: 'Trailer', key: 'abc' };
const details = {
  ...movie,
  tagline: 'Why are they here?',
  runtime: 116,
  genres: [{ id: 1, name: 'Science Fiction' }],
  status: 'Released',
  budget: 47000000,
  revenue: 203388186,
  vote_count: 12000,
  production_countries: [{ name: 'United States' }],
  spoken_languages: [{ english_name: 'English' }],
  production_companies: [{ name: 'Paramount' }],
  credits: {
    crew: [{ job: 'Director', name: 'Denis Villeneuve' }],
    cast: [
      {
        id: 10,
        name: 'Amy Adams',
        character: 'Louise Banks',
        profile_path: '/amy.jpg',
      },
    ],
  },
  recommendations: { results: [sequel] },
};
const response = (results) => ({ ok: true, json: async () => ({ results }) });
function defaultFetch(url) {
  if (url.includes('/videos')) return Promise.resolve(response([video]));
  if (url.includes('append_to_response'))
    return Promise.resolve({
      ok: true,
      json: async () =>
        url.includes('/movie/2?')
          ? { ...details, ...sequel, recommendations: { results: [] } }
          : details,
    });
  if (url.includes('/now_playing'))
    return Promise.resolve(response([movie, sequel, third]));
  if (url.includes('/search')) return Promise.resolve(response([sequel]));
  return Promise.resolve(response([]));
}
function CurrentPath() {
  return <span aria-label="Current path">{useLocation().pathname}</span>;
}
function renderStore(element, state, path = '/browse') {
  return render(
    <Provider store={createAppStore(state)}>
      <MemoryRouter initialEntries={[path]}>
        <CurrentPath />
        <Routes>
          <Route path="/browse" element={element} />
          <Route path="/movie/:movieId" element={<MoviePage />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(defaultFetch));
  vi.stubGlobal('scrollTo', vi.fn());
});
afterEach(() => vi.useRealTimers());

describe('movie browsing', () => {
  it('renders loading and empty catalog states', () => {
    const view = renderStore(<MainContainer onSelect={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading movies');
    view.unmount();
    renderStore(<MainContainer onSelect={vi.fn()} />, {
      movies: { nowPlayingMovies: [], nowPlayingError: null },
    });
    expect(screen.getByRole('status')).toHaveTextContent('No movies');
  });
  it('renders cards with image fallbacks and selection', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <MovieCard movie={movie} onSelect={onSelect} />,
    );
    fireEvent.error(container.querySelector('img'));
    expect(container.querySelector('img')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'View Arrival' }));
    expect(onSelect).toHaveBeenCalledWith(movie);
  });
  it('navigates to a full movie page and back to browsing', async () => {
    const user = userEvent.setup();
    renderStore(<Browse />);
    await user.click(
      await screen.findByRole('button', { name: 'View Arrival' }),
    );
    expect(
      screen.getByRole('article', { name: 'Arrival' }),
    ).toHaveAccessibleName('Arrival');
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/movie/1');
    expect(await screen.findByText('Denis Villeneuve')).toBeInTheDocument();
    expect(screen.getByText('Amy Adams')).toBeInTheDocument();
    expect(screen.getByText('Louise Banks')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('$47,000,000')).toBeInTheDocument();
    expect(screen.getByText(/1h 56m/)).toBeInTheDocument();
    expect(
      screen.queryByTitle('Arrival banner trailer'),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Back to browse' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'View Arrival' }),
    ).toBeInTheDocument();
  });
  it('shows discovery after the banner and includes four more categories', async () => {
    renderStore(<Browse />);
    const banner = await screen.findByRole('region', {
      name: 'Featured movie trailers',
    });
    const discover = screen.getByRole('heading', { name: 'Discover movies' });
    expect(
      banner.compareDocumentPosition(discover) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const title of [
      'Now playing',
      'Trending this week',
      'Popular movies',
      'Top rated',
      'Coming soon',
    ])
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });
  it('shows search results above the existing sections and removes only results when cleared', async () => {
    const user = userEvent.setup();
    renderStore(<Browse />);
    const originalCard = await screen.findByRole('button', {
      name: 'View Arrival',
    });
    await user.type(screen.getByRole('searchbox'), 'Interstellar');
    const results = screen.getByRole('region', { name: 'Search results' });
    expect(
      await within(results).findByRole('button', { name: 'View Interstellar' }),
    ).toBeInTheDocument();
    for (const title of [
      'Now playing',
      'Trending this week',
      'Popular movies',
      'Top rated',
      'Coming soon',
    ]) {
      const heading = screen.getByRole('heading', { name: title });
      expect(
        results.compareDocumentPosition(heading) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'View Arrival' })).toBe(
      originalCard,
    );
    expect(
      fetch.mock.calls.some(([url]) => url.includes('query=Interstellar')),
    ).toBe(true);
    await user.clear(screen.getByRole('searchbox'));
    expect(
      screen.queryByRole('region', { name: 'Search results' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Arrival' })).toBe(
      originalCard,
    );
  });
  it('shows a useful empty search state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([])));
    const user = userEvent.setup();
    renderStore(<Browse />);
    await user.type(screen.getByRole('searchbox'), 'unknown');
    expect(await screen.findByText(/No movies found/)).toBeInTheDocument();
  });
  it('recovers from a catalog request failure', async () => {
    let attempts = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        url.includes('/now_playing') && attempts++ === 0
          ? Promise.resolve({ ok: false })
          : defaultFetch(url),
      ),
    );
    const user = userEvent.setup();
    renderStore(<Browse />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load movies',
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(
      await screen.findByRole('button', { name: 'View Arrival' }),
    ).toBeInTheDocument();
  });
  it('retries an individual category without breaking the catalog', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(response([movie])),
    );
    const user = userEvent.setup();
    render(
      <MovieCategory
        title="Popular movies"
        path="/movie/popular"
        onSelect={vi.fn()}
      />,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load this section',
    );
    await user.click(
      screen.getByRole('button', { name: 'Retry Popular movies' }),
    );
    expect(
      await screen.findByRole('button', { name: 'View Arrival' }),
    ).toBeInTheDocument();
  });
});

describe('video banner', () => {
  function renderBanner() {
    return renderStore(<MainContainer onSelect={vi.fn()} />, {
      movies: {
        nowPlayingMovies: [movie, sequel, third],
        nowPlayingError: null,
      },
    });
  }
  it('autoplays muted video and switches between at least three slides', async () => {
    const user = userEvent.setup();
    renderBanner();
    const iframe = await screen.findByTitle('Arrival banner trailer');
    expect(
      screen.queryByRole('button', { name: 'Next featured movie' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Previous featured movie' }),
    ).not.toBeInTheDocument();
    expect(iframe.src).toContain('autoplay=1&mute=1');
    expect(iframe).toHaveAttribute(
      'allow',
      expect.stringContaining('autoplay'),
    );
    expect(
      screen.getByRole('button', { name: 'Show Arrival' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Show Interstellar' }));
    expect(
      await screen.findByTitle('Interstellar banner trailer'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show Dune' }));
    expect(await screen.findByTitle('Dune banner trailer')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show Interstellar' }));
    expect(
      await screen.findByTitle('Interstellar banner trailer'),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Pause banner videos' }),
    );
    expect(
      screen.queryByTitle('Interstellar banner trailer'),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Play banner videos' }),
    );
    expect(
      await screen.findByTitle('Interstellar banner trailer'),
    ).toBeInTheDocument();
  });
  it('rotates automatically and stops on keyboard focus', async () => {
    vi.useFakeTimers();
    renderBanner();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(
      screen.getByRole('heading', { name: 'Interstellar' }),
    ).toBeInTheDocument();
    fireEvent.focus(screen.getByRole('button', { name: 'Show Interstellar' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });
    expect(
      screen.getByRole('heading', { name: 'Interstellar' }),
    ).toBeInTheDocument();
  });
  it('falls back to the backdrop when no trailer is provided', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response([])));
    renderBanner();
    expect(await screen.findByText(/Preview unavailable/)).toBeInTheDocument();
    expect(
      screen.queryByTitle('Arrival banner trailer'),
    ).not.toBeInTheDocument();
  });
});

describe('expanded movie details', () => {
  it('loads a movie directly from its URL and plays its trailer on demand', async () => {
    renderStore(<Browse />, undefined, '/movie/1');
    expect(
      await screen.findByRole('heading', { name: 'Arrival', level: 1 }),
    ).toBeInTheDocument();
    expect(await screen.findByTitle('Arrival trailer')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abc',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('navigates to a related movie page', async () => {
    const user = userEvent.setup();
    renderStore(<Browse />, undefined, '/movie/1');
    await user.click(
      await screen.findByRole('button', { name: 'View Interstellar' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Interstellar', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/movie/2');
    expect(
      await screen.findByTitle('Interstellar trailer'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('handles invalid movie URLs without sending API requests', () => {
    renderStore(<Browse />, undefined, '/movie/invalid');
    expect(
      screen.getByRole('heading', { name: 'Movie not found' }),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('retains the synopsis when details fail and recovers on retry', async () => {
    let attempts = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        url.includes('append_to_response') && attempts++ === 0
          ? Promise.resolve({ ok: false })
          : defaultFetch(url),
      ),
    );
    const user = userEvent.setup();
    render(<MovieDetails movie={movie} onSelect={vi.fn()} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Full movie details could not be loaded',
    );
    expect(screen.getByText(movie.overview)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry details' }));
    expect(await screen.findByText('Denis Villeneuve')).toBeInTheDocument();
  });
  it('handles missing optional information and trailer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) =>
        Promise.resolve(
          url.includes('append_to_response')
            ? { ok: true, json: async () => ({ id: 1, title: 'Arrival' }) }
            : response([]),
        ),
      ),
    );
    render(<MovieDetails movie={movie} onSelect={vi.fn()} />);
    expect(
      await screen.findByText('Cast information is not available.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No trailer is available for this movie.'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('article', { name: 'Arrival' })).getByText(
        'No synopsis available.',
      ),
    ).toBeInTheDocument();
  });
});
