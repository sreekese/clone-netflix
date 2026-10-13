import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import MovieDetails from './MovieDetails';

export default function MoviePage() {
  const { movieId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const id = Number(movieId);
  const valid = /^\d+$/.test(movieId) && Number.isSafeInteger(id) && id > 0;
  const movie = state?.movie?.id === id ? state.movie : { id };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movieId]);
  return (
    <>
      <Header overlay />
      <main className="movie-page-main">
        <Link className="back-to-browse" to="/browse">
          Back to browse
        </Link>
        {valid ? (
          <MovieDetails
            key={id}
            movie={movie}
            onSelect={(next) =>
              navigate(`/movie/${next.id}`, { state: { movie: next } })
            }
          />
        ) : (
          <div className="status">
            <h1>Movie not found</h1>
            <p>Choose a movie from the catalog to view its details.</p>
          </div>
        )}
      </main>
    </>
  );
}
