import { createSlice } from '@reduxjs/toolkit';
import { removeUser } from './userSlice';

const initialState = { nowPlayingMovies: null, nowPlayingError: null };
const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addNowPlayingMovies: (state, action) => {
      state.nowPlayingMovies = action.payload;
      state.nowPlayingError = null;
    },
    setNowPlayingError: (state, action) => {
      state.nowPlayingError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(removeUser, () => initialState);
  },
});
export const { addNowPlayingMovies, setNowPlayingError } = moviesSlice.actions;
export default moviesSlice.reducer;
