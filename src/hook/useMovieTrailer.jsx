import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { addmovietrailer } from '../utlis/moviesSlice';
import { API_OPTIONS } from '../utlis/constant';

const useMovieTrailer = (videoid) => {

    const dispatch = useDispatch();

    const movievideo = async() =>{

        const videodata  = await fetch("https://api.themoviedb.org/3/movie/"+ videoid +"/videos", API_OPTIONS);
        const datajson = await videodata.json();
        
        const trailerdata = datajson.results.filter((item) => (item.type === "Trailer"));
        const trailer = trailerdata.length ? trailerdata[0] : datajson.results[0];
        dispatch(addmovietrailer(trailer));
    }
    useEffect(() =>{
        movievideo();
    },[]);
}

export default useMovieTrailer
