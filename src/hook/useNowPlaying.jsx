import { useDispatch } from "react-redux";
import { addNowPlayingMovies, setNowPlayingError } from "../utlis/moviesSlice";
import { useEffect } from "react";
import { API_OPTIONS, TMDB_API_BASE_URL } from "../utlis/constant";

const useNowPlaying = () => {
      const dispatch = useDispatch();

      useEffect(() => {
            const controller = new AbortController();

            const fetchNowPlaying = async () => {
                  dispatch(setNowPlayingError(null));

                  try {
                        const response = await fetch(
                              `${TMDB_API_BASE_URL}/3/movie/now_playing`,
                              { ...API_OPTIONS, signal: controller.signal }
                        );
                        if (!response.ok) {
                              throw new Error(`TMDB request failed with status ${response.status}`);
                        }

                        const data = await response.json();
                        if (!Array.isArray(data.results)) {
                              throw new Error("TMDB returned an invalid movie list");
                        }

                        dispatch(addNowPlayingMovies(data.results));
                  } catch (error) {
                        if (!controller.signal.aborted) {
                              console.error("Unable to load now-playing movies", error);
                              dispatch(setNowPlayingError("Unable to load movies. Please try again later."));
                        }
                  }
            };

            fetchNowPlaying();
            return () => controller.abort();
      }, [dispatch]);
}

export default useNowPlaying;