import { useState } from 'react';
import { useSelector } from 'react-redux';
import Header from './Header';
import useNowPlaying from '../hook/useNowPlaying';
import MainContainer from './MainContainer';
import SecondaryContainer from './SecondaryContainer';
import { useNavigate } from 'react-router-dom';
import MovieSearch from './MovieSearch';

export default function Browse() {
  const [retry, setRetry] = useState(0);
  const navigate = useNavigate();
  const openMovie = (movie) =>
    navigate(`/movie/${movie.id}`, { state: { movie } });
  const { nowPlayingError } = useSelector((state) => state.movies);
  useNowPlaying(retry);
  return (
    <>
      <Header overlay />
      <main className="browse-main">
        <MainContainer onSelect={openMovie} />
        <MovieSearch onSelect={openMovie} />
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
    </>
  );
}
