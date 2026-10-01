import {  useSelector } from 'react-redux';
import useMovieTrailer from '../hook/useMovieTrailer';

const Videobackground = ({videoid}) => {
    const trailervideo = useSelector(store => store.movies?.trailermovievideo);
    useMovieTrailer(videoid);
    return (
        <div className='relative w-screen aspect-video overflow-hidden'>
        {trailervideo?.key && (
            <iframe
            className='w-screen aspect-video'
            title="Featured movie trailer"
            src={`https://www.youtube.com/embed/${trailervideo.key}?autoplay=1&mute=1`}
            />
        )}
        </div>
    )
}

export default Videobackground;
