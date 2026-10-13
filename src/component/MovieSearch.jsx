import { useEffect, useState } from 'react';
import { MovieRowShimmer } from './Shimmer';
import MovieList from './MovieList';
import { fetchMovieData } from '../services/movies';

export default function MovieSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState(null);
  const [retry, setRetry] = useState(0);
  const term = query.trim();
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
            <MovieRowShimmer
              title={`Results for “${term}”`}
              label="Searching…"
            />
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
              onSelect={onSelect}
            />
          ) : (
            <p role="status">
              No movies found for “{term}”. Try another title.
            </p>
          )}
        </section>
      )}
    </>
  );
}
