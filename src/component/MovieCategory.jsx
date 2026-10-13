import { useViewport } from '../hook/useVisibility';
import { useState } from 'react';
import useMovieCollection from '../hook/useMovieCollection';
import { MovieRowShimmer } from './Shimmer';
import MovieList from './MovieList';

function LoadedCategory({ title, path, onSelect }) {
  const [retry, setRetry] = useState(0);
  const { movies, error } = useMovieCollection(path, retry);
  if (!movies && !error) return <MovieRowShimmer title={title} />;
  if (movies?.length)
    return <MovieList title={title} movies={movies} onSelect={onSelect} />;
  return (
    <section className="movie-section" aria-label={title}>
      <h2>{title}</h2>
      {error ? (
        <>
          <p role="alert">{error}</p>
          <button
            className="button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry {title}
          </button>
        </>
      ) : (
        <p role="status">
          {movies
            ? 'No movies available in this section.'
            : `Loading ${title.toLowerCase()}…`}
        </p>
      )}
    </section>
  );
}

export default function MovieCategory(props) {
  const [ref, visible] = useViewport({ once: true, rootMargin: '400px' });
  return (
    <div ref={ref}>
      {visible ? (
        <LoadedCategory {...props} />
      ) : (
        <MovieRowShimmer title={props.title} />
      )}
    </div>
  );
}
