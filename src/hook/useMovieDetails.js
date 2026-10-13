import { useEffect, useState } from 'react';
import { fetchMovieDetails } from '../services/movies';

export default function useMovieDetails(movieId, retry) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchMovieDetails(movieId, controller.signal)
      .then((details) => {
        if (!controller.signal.aborted) setResult({ movieId, retry, details });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            movieId,
            retry,
            error: 'Full movie details could not be loaded.',
          });
      });
    return () => controller.abort();
  }, [movieId, retry]);
  return result?.movieId === movieId && result.retry === retry
    ? result
    : { loading: true };
}
