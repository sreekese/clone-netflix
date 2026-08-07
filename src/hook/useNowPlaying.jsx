import { useDispatch } from "react-redux";
import { addNowPlayingMovies } from "../utlis/moviesSlice";
import { useEffect } from "react";
import { API_OPTIONS } from "../utlis/constant";

const useNowPlaying = () => {

const dispatch = useDispatch();
const nowPlayingMovies = async() => {
    
      const movies = await fetch("https://api.themoviedb.org/3/movie/now_playing", API_OPTIONS);
      const movielist = await movies.json();
     dispatch(addNowPlayingMovies(movielist.results))
  }
  useEffect(() => {
      nowPlayingMovies();
},[]);
}

export default useNowPlaying;