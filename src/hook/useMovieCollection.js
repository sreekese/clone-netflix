import { useEffect, useState } from 'react';
import { fetchMovieData } from '../services/movies';

export default function useMovieCollection(path, retry = 0) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchMovieData(path, controller.signal)
      .then((movies) => {
        if (!controller.signal.aborted) setResult({ path, retry, movies });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            path,
            retry,
            error: 'Unable to load this section. Please try again.',
          });
      });
    return () => controller.abort();
  }, [path, retry]);
  return result?.path === path && result.retry === retry
    ? result
    : { movies: null };
}
