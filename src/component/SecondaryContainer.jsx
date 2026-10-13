import { useSelector } from 'react-redux';
import { MovieRowShimmer } from './Shimmer';
import MovieList from './MovieList';
import MovieCategory from './MovieCategory';

const categories = [
  { title: 'Trending this week', path: '/trending/movie/week?language=en-US' },
  { title: 'Popular movies', path: '/movie/popular?language=en-US' },
  { title: 'Top rated', path: '/movie/top_rated?language=en-US' },
  { title: 'Coming soon', path: '/movie/upcoming?language=en-US' },
];
export default function SecondaryContainer({ onSelect }) {
  const { nowPlayingMovies: movies, nowPlayingError } = useSelector(
    (state) => state.movies,
  );
  return (
    <>
      {movies === null && !nowPlayingError ? (
        <MovieRowShimmer title="Now playing" />
      ) : (
        <MovieList title="Now playing" movies={movies} onSelect={onSelect} />
      )}
      {categories.map((category) => (
        <MovieCategory key={category.path} {...category} onSelect={onSelect} />
      ))}
    </>
  );
}
