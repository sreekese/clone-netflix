import { configureStore } from '@reduxjs/toolkit';
import user from './userSlice';
import movies from './moviesSlice';
import session from './sessionSlice';

export const createAppStore = (preloadedState) =>
  configureStore({ reducer: { user, movies, session }, preloadedState });
export default createAppStore();
