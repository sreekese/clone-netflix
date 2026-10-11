import MovieCard from './MovieCard';

export default function MovieList({ title, movies, onSelect }) {
  if (!movies?.length) return null;
  return (
    <section className="movie-section">
      <h2>{title}</h2>
      <div className="movie-row">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
