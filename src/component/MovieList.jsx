import MovieCard from './MovieCard'

const MovieList = ({title, movies}) => {

  if (!movies || movies.length === 0) return null;
    return (
        <div className='px-6'>
            <h1 className='text-3xl font-bold py-4 text-white'>{title}</h1>
            <div className='flex scroll-smooth py-6'>
                <div className='flex' >
                {movies.map(movie => <MovieCard key={movie.id} movieposter={movie?.poster_path}/>)}   
                </div>
            </div>
        </div>
    )
}

export default MovieList
