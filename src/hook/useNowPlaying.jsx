import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { addNowPlayingMovies, setNowPlayingError } from '../utlis/moviesSlice';
import { fetchMovieData } from '../services/movies';

export default function useNowPlaying(retry = 0) {
  const dispatch = useDispatch();
  useEffect(() => {
    const controller = new AbortController();
    dispatch(setNowPlayingError(null));
    fetchMovieData('/movie/now_playing?language=en-US', controller.signal)
      .then((movies) => {
        if (!controller.signal.aborted) dispatch(addNowPlayingMovies(movies));
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          dispatch(setNowPlayingError(error.message));
      });
    return () => controller.abort();
  }, [dispatch, retry]);
}
