import { useEffect, useState } from 'react';
import { fetchMovieData, selectTrailer } from '../services/movies';

export default function useMovieTrailer(movieId) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!movieId) return;
    const controller = new AbortController();
    fetchMovieData(`/movie/${movieId}/videos`, controller.signal)
      .then((videos) => {
        if (!controller.signal.aborted)
          setResult({ movieId, trailer: selectTrailer(videos), error: null });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            movieId,
            trailer: null,
            error: 'Trailer could not be loaded.',
          });
      });
    return () => controller.abort();
  }, [movieId]);
  return result?.movieId === movieId
    ? { ...result, loading: false }
    : { trailer: null, error: null, loading: Boolean(movieId) };
}
