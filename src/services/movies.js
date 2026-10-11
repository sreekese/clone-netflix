import { API_OPTIONS, TMDB_API_BASE_URL } from '../utlis/constant';

async function requestMovieData(path, signal) {
  const response = await fetch(`${TMDB_API_BASE_URL}/3${path}`, {
    ...API_OPTIONS,
    signal,
  });
  if (!response.ok) throw new Error('Unable to load movies. Please try again.');
  return response.json();
}

export async function fetchMovieData(path, signal) {
  const data = await requestMovieData(path, signal);
  if (!Array.isArray(data.results))
    throw new Error('The movie service returned an invalid response.');
  return data.results;
}

export function selectTrailer(videos) {
  const supported = videos.filter(
    (video) =>
      video.site === 'YouTube' && /^[a-zA-Z0-9_-]+$/.test(video.key || ''),
  );
  return (
    supported.find((video) => video.type === 'Trailer' && video.official) ??
    supported.find((video) => video.type === 'Trailer') ??
    supported.find((video) => video.type === 'Teaser') ??
    null
  );
}

export async function fetchMovieDetails(movieId, signal) {
  const data = await requestMovieData(
    `/movie/${movieId}?append_to_response=credits,recommendations,similar&language=en-US`,
    signal,
  );
  if (!data || data.id !== movieId || typeof data.title !== 'string')
    throw new Error('Movie details are unavailable.');
  return data;
}
