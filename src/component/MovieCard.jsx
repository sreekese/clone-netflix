import { useState } from 'react';
import { IMG_POSTER_URL } from '../utlis/constant';

export default function MovieCard({ movie, onSelect }) {
  const [failed, setFailed] = useState(false);
  const title = movie.title || movie.original_title || 'Untitled movie';
  return (
    <button
      className="movie-card"
      onClick={() => onSelect(movie)}
      aria-label={`View ${title}`}
    >
      {movie.poster_path && !failed ? (
        <img
          src={`${IMG_POSTER_URL}${movie.poster_path}`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="poster-fallback">{title}</span>
      )}
      <span className="movie-title">{title}</span>
      <span className="muted">
        {movie.release_date?.slice(0, 4) || 'Coming soon'}
      </span>
    </button>
  );
}
