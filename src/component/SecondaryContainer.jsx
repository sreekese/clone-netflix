import MovieList from './MovieList'
import { useSelector } from 'react-redux'

const SecondaryContainer = () => {

    const movies = useSelector((store) => store.movies);

    return (
        <div className='flex overflow-x-auto scrollbar-hide bg-black'>
            <div className=''>
                <MovieList title = {"Now Playing"} movies = {movies?.nowPlayingMovies} />

            </div>
        </div>
    )
}

export default SecondaryContainer;
