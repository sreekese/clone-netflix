import React from 'react'
import { useSelector } from 'react-redux'
import VideoTitle from './VideoTitle'
import Videobackground from './Videobackground';

const MainContainer = () => {

const movies = useSelector( store => store.movies?.nowPlayingMovies);
if (movies === null ) return;

const onemovie = movies[2];
const { original_title, overview, id } = onemovie;
return (
    <div>
        <VideoTitle title={original_title} description = {overview}/>
        <Videobackground videoid={id}/>
    </div>
  )
}

export default MainContainer;
