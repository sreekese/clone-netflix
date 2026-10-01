import { useSelector } from 'react-redux'
import VideoTitle from './VideoTitle'
import Videobackground from './Videobackground';

const MainContainer = () => {
    const { nowPlayingMovies: movies, nowPlayingError, trailermovievideo } = useSelector((store) => store.movies);

        if (nowPlayingError) {
            return <p role="alert" className="p-8 text-white">{nowPlayingError}</p>;
        }

        if (movies === null) {
            return <p role="status" className="p-8 text-white">Loading movies...</p>;
        }

    const featuredMovie = movies[2] ?? movies[0];
        if (!featuredMovie) {
            return <p role="status" className="p-8 text-white">No movies are available right now.</p>;
        }

    const { original_title, overview, id } = featuredMovie;
        return (
            <div>
            <VideoTitle
                title={original_title}
                description={overview}
                movieId={id}
                trailerKey={trailermovievideo?.key}
            />
            <Videobackground videoid={id} />
            </div>
        );
}

export default MainContainer;
