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
export const IMG_POSTER_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
