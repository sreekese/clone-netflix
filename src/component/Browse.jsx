import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import useNowPlaying from '../hook/useNowPlaying';
import MainContainer from './MainContainer';
import SecondaryContainer from './SecondaryContainer';
import MovieList from './MovieList';
import { useNavigate } from 'react-router-dom';
import { fetchMovieData } from '../services/movies';

export default function Browse() {
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(null);
  const navigate = useNavigate();
  const openMovie = (movie) =>
    navigate(`/movie/${movie.id}`, { state: { movie } });
  const { nowPlayingError } = useSelector((state) => state.movies);
  const term = query.trim();
  useNowPlaying(retry);
  useEffect(() => {
    if (!term) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchMovieData(
        `/search/movie?query=${encodeURIComponent(term)}&include_adult=false`,
        controller.signal,
      )
        .then((movies) => {
          if (!controller.signal.aborted) setSearch({ term, movies });
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setSearch({
              term,
              error: 'Search is unavailable. Please try again.',
            });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, retry]);
  return (
    <>
      <Header overlay />
      <main className="browse-main">
        <MainContainer onSelect={openMovie} />
        <div className="browse-toolbar">
          <h1>Discover movies</h1>
          <label className="search-label">
            Search movies
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title…"
            />
          </label>
        </div>
        {term && (
          <section className="search-results" aria-label="Search results">
            {search?.term !== term ? (
              <p role="status">Searching…</p>
            ) : search.error ? (
              <p role="alert">
                {search.error}{' '}
                <button onClick={() => setRetry((value) => value + 1)}>
                  Try again
                </button>
              </p>
            ) : search.movies.length ? (
              <MovieList
                title={`Results for “${term}”`}
                movies={search.movies}
                onSelect={openMovie}
              />
            ) : (
              <p role="status">
                No movies found for “{term}”. Try another title.
              </p>
            )}
          </section>
        )}
        {nowPlayingError && (
          <div className="retry">
            <button
              className="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        )}
        <SecondaryContainer onSelect={openMovie} />
      </main>
      <footer>
        Movie data provided by TMDB. This product is not endorsed or certified
        by TMDB.
      </footer>
    </>
  );
}
