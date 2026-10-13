import { IMG_BACKDROP_URL, backdropSrcSet } from '../utlis/constant';
import Shimmer from './Shimmer';
import useMovieTrailer from '../hook/useMovieTrailer';

export default function Videobackground({ movie, playing }) {
  const { trailer, loading, error } = useMovieTrailer(movie.id);
  return (
    <>
      {movie.backdrop_path ? (
        <img
          className="featured-backdrop"
          src={`${IMG_BACKDROP_URL}${movie.backdrop_path}`}
          srcSet={backdropSrcSet(movie.backdrop_path)}
          sizes="100vw"
          fetchPriority="high"
          decoding="async"
          alt=""
        />
      ) : (
        <div className="featured-backdrop fallback" />
      )}
      {trailer && playing && (
        <iframe
          referrerPolicy="strict-origin-when-cross-origin"
          className="banner-video"
          title={`${movie.title || movie.original_title} banner trailer`}
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&rel=0`}
          allow="autoplay; encrypted-media; picture-in-picture"
          tabIndex={-1}
        />
      )}
      {loading && (
        <div className="banner-preview-loading">
          <Shimmer variant="video" label="Loading preview…" />
        </div>
      )}
      {!trailer && !loading && (
        <p className="banner-video-status">
          {loading
            ? 'Loading preview…'
            : error ||
              'Preview unavailable · Open details to explore this movie'}
        </p>
      )}
    </>
  );
}
