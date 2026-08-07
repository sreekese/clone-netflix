import { createSlice } from "@reduxjs/toolkit";

const moviesSlice = createSlice({
    name: 'movies',
    initialState: {
        nowPlayingMovies:null,
        trailermovievideo:null
    },
    reducers: {
        addNowPlayingMovies: (state,action) => {
            state.nowPlayingMovies = action.payload;

        },
        addmovietrailer: (state,action) => {
            state.trailermovievideo = action.payload;
        }
    }
});


export const {addNowPlayingMovies, addmovietrailer} = moviesSlice.actions;
export default moviesSlice.reducer;