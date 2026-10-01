import { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { addmovietrailer } from '../utlis/moviesSlice';
import { API_OPTIONS, TMDB_API_BASE_URL } from '../utlis/constant';

const useMovieTrailer = (videoid) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!videoid) {
            dispatch(addmovietrailer(null));
            return;
        }

        const controller = new AbortController();
        dispatch(addmovietrailer(null));

        const fetchTrailer = async () => {
            try {
                const response = await fetch(
                    `${TMDB_API_BASE_URL}/3/movie/${videoid}/videos`,
                    { ...API_OPTIONS, signal: controller.signal }
                );
                if (!response.ok) {
                    throw new Error(`TMDB trailer request failed with status ${response.status}`);
                }

                const data = await response.json();
                const videos = Array.isArray(data.results) ? data.results : [];
                const trailer = videos.find((video) => video.type === 'Trailer') ?? videos[0] ?? null;
                dispatch(addmovietrailer(trailer));
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("Unable to load movie trailer", error);
                    dispatch(addmovietrailer(null));
                }
            }
        };

        fetchTrailer();
        return () => controller.abort();
    }, [dispatch, videoid]);
}

export default useMovieTrailer
