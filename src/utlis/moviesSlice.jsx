import { createSlice } from "@reduxjs/toolkit";

const moviesSlice = createSlice({
    name: 'movies',
    initialState: {
        nowPlayingMovies:null,
        nowPlayingError:null,
        trailermovievideo:null
    },
    reducers: {
        addNowPlayingMovies: (state,action) => {
            state.nowPlayingMovies = action.payload;
            state.nowPlayingError = null;

        },
        setNowPlayingError: (state, action) => {
            state.nowPlayingError = action.payload;

        },
        addmovietrailer: (state,action) => {
            state.trailermovievideo = action.payload;
        }
    }
});


export const {addNowPlayingMovies, setNowPlayingError, addmovietrailer} = moviesSlice.actions;
export default moviesSlice.reducer;