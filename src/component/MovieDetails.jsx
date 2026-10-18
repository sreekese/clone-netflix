import { useState } from 'react';
import useMovieTrailer from '../hook/useMovieTrailer';
import useMovieDetails from '../hook/useMovieDetails';
import {
  IMG_POSTER_URL,
  IMG_BACKDROP_URL,
  backdropSrcSet,
  posterSrcSet,
} from '../utlis/constant';
import Shimmer from './Shimmer';
import MovieList from './MovieList';

const money = (value) =>
  value > 0
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value)
    : 'Not reported';

export default function MovieDetails({ movie, onSelect }) {
  const [retry, setRetry] = useState(0);
  const selected = movie;
  const {
    trailer,
    loading: trailerLoading,
    error: trailerError,
  } = useMovieTrailer(selected.id);
  const { details, loading, error } = useMovieDetails(selected.id, retry);
  const info = details || selected;
  const title = info.title || info.original_title || 'Movie details';
  const directors = details?.credits?.crew
    ?.filter((person) => person.job === 'Director')
    .map((person) => person.name)
    .join(', ');
  const related = details?.recommendations?.results?.length
    ? details.recommendations.results
    : details?.similar?.results;
  return (
    <article className="movie-detail-page" aria-labelledby="movie-detail-title">
      {info.backdrop_path && (
        <img
          className="detail-backdrop"
          src={`${IMG_BACKDROP_URL}${info.backdrop_path}`}
          srcSet={backdropSrcSet(info.backdrop_path)}
          sizes="100vw"
          decoding="async"
          alt=""
        />
      )}
      <div className="detail-content">
        <div className="detail-heading">
          {info.poster_path && (
            <img
              className="detail-poster"
              src={`${IMG_POSTER_URL}${info.poster_path}`}
              srcSet={posterSrcSet(info.poster_path)}
              sizes="(max-width: 600px) 95px, 170px"
              decoding="async"
              alt={`${title} poster`}
            />
          )}
          <div>
            <p className="eyebrow">MOVIE DETAILS</p>
            <h1 id="movie-detail-title">{title}</h1>
            {details?.tagline && (
              <p className="detail-tagline">{details.tagline}</p>
            )}
            <p className="detail-meta">
              {info.release_date?.slice(0, 4) || 'Release date unavailable'}
              {details?.runtime > 0 &&
                ` · ${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`}
              {info.vote_average > 0 &&
                ` · ★ ${info.vote_average.toFixed(1)} / 10`}
              {details?.vote_count > 0 &&
                ` (${details.vote_count.toLocaleString()} votes)`}
            </p>
            <div className="genre-tags">
              {details?.genres?.map((genre) => (
                <span key={genre.id}>{genre.name}</span>
              ))}
            </div>
          </div>
        </div>
        <section className="detail-section">
          <h2>Story</h2>
          <p>{info.overview || 'No synopsis available.'}</p>
        </section>
        {loading && (
          <Shimmer variant="details" label="Loading movie details…" />
        )}
        {error && (
          <div role="alert">
            <p>{error}</p>
            <button
              className="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry details
            </button>
          </div>
        )}
        {details && (
          <section className="detail-section">
            <h2>About the movie</h2>
            <dl className="movie-facts">
              <div>
                <dt>Director</dt>
                <dd>{directors || 'Not listed'}</dd>
              </div>
              <div>
                <dt>Release date</dt>
                <dd>{details.release_date || 'Not announced'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{details.status || 'Not listed'}</dd>
              </div>
              <div>
                <dt>Original title</dt>
                <dd>{details.original_title || title}</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>
                  {details.spoken_languages
                    ?.map((language) => language.english_name || language.name)
                    .join(', ') || 'Not listed'}
                </dd>
              </div>
              <div>
                <dt>Countries</dt>
                <dd>
                  {details.production_countries
                    ?.map((country) => country.name)
                    .join(', ') || 'Not listed'}
                </dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>{money(details.budget)}</dd>
              </div>
              <div>
                <dt>Box office</dt>
                <dd>{money(details.revenue)}</dd>
              </div>
              <div className="full-fact">
                <dt>Production</dt>
                <dd>
                  {details.production_companies
                    ?.map((company) => company.name)
                    .join(', ') || 'Not listed'}
                </dd>
              </div>
            </dl>
          </section>
        )}
        <section className="detail-section">
          <h2>Trailer</h2>
          {trailerLoading ? (
            <Shimmer variant="video" label="Loading trailer…" />
          ) : trailer ? (
            <>
              <iframe
                referrerPolicy="strict-origin-when-cross-origin"
                title={`${title} trailer`}
                src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
              <a
                className="text-button"
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube ↗
              </a>
            </>
          ) : (
            <p role="status">
              {trailerError || 'No trailer is available for this movie.'}
            </p>
          )}
        </section>
        {details && (
          <section className="detail-section">
            <h2>Cast</h2>
            {details.credits?.cast?.length ? (
              <div className="cast-row">
                {details.credits.cast.slice(0, 16).map((person) => (
                  <article className="cast-card" key={person.id}>
                    {person.profile_path ? (
                      <img
                        loading="lazy"
                        src={`${IMG_POSTER_URL}${person.profile_path}`}
                        srcSet={posterSrcSet(person.profile_path)}
                        sizes="115px"
                        decoding="async"
                        alt={person.name}
                      />
                    ) : (
                      <div className="cast-fallback" aria-hidden="true">
                        {person.name?.slice(0, 1)}
                      </div>
                    )}
                    <h3>{person.name}</h3>
                    <p className="muted">{person.character || 'Cast member'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">Cast information is not available.</p>
            )}
          </section>
        )}
        {details &&
          (related?.length ? (
            <MovieList
              title="More like this"
              movies={related.filter((item) => item.id !== selected.id)}
              onSelect={onSelect}
            />
          ) : (
            <p className="muted">No related movies are available yet.</p>
          ))}
      </div>
    </article>
  );
}
