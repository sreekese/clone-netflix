import { useSelector } from 'react-redux';
import MovieList from './MovieList';
import MovieCategory from './MovieCategory';

const categories = [
  { title: 'Trending this week', path: '/trending/movie/week?language=en-US' },
  { title: 'Popular movies', path: '/movie/popular?language=en-US' },
  { title: 'Top rated', path: '/movie/top_rated?language=en-US' },
  { title: 'Coming soon', path: '/movie/upcoming?language=en-US' },
];
export default function SecondaryContainer({ onSelect }) {
  const movies = useSelector((state) => state.movies.nowPlayingMovies);
  return (
    <>
      <MovieList title="Now playing" movies={movies} onSelect={onSelect} />
      {categories.map((category) => (
        <MovieCategory key={category.path} {...category} onSelect={onSelect} />
      ))}
    </>
  );
}
