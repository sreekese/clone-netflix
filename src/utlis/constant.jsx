export const TMDB_API_BASE_URL =
  import.meta.env.VITE_TMDB_API_BASE_URL || 'https://api.themoviedb.org';
export const API_OPTIONS = {
  headers: {
    accept: 'application/json',
    ...(import.meta.env.VITE_TMDB_ACCESS_TOKEN
      ? { Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}` }
      : {}),
  },
};
export const IMG_POSTER_URL = 'https://image.tmdb.org/t/p/w342';
export const IMG_BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';

export const posterSrcSet = (path) =>
  [185, 342, 500]
    .map((width) => `https://image.tmdb.org/t/p/w${width}${path} ${width}w`)
    .join(', ');
export const backdropSrcSet = (path) =>
  [300, 780, 1280]
    .map((width) => `https://image.tmdb.org/t/p/w${width}${path} ${width}w`)
    .join(', ');
