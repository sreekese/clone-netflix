const VideoTitle = ({title, description, movieId, trailerKey}) => {
    return (
        <div className='align-middle px-10 absolute z-10 text-white bg-linear-to-r from-black w-screen aspect-video'>
            <div className='pt-36 px-12'>
                <h1 className='text-6xl py-4 font-bold align-middle' >{title}</h1>
                <p className='w-1/3'>{description}</p>
                <div className="flex gap-3 py-4">
                    {trailerKey ? (
                        <a
                        className="rounded bg-white px-5 py-2 font-semibold text-black"
                        href={`https://www.youtube.com/watch?v=${trailerKey}`}
                        target="_blank"
                        rel="noreferrer"
                        >
                        Play
                        </a>
                    ) : (
                        <button className="rounded bg-white px-5 py-2 font-semibold text-black opacity-60" disabled>
                        Play
                        </button>
                    )}
                    <a
                        className="rounded bg-gray-600 px-5 py-2 font-semibold text-white"
                        href={`https://www.themoviedb.org/movie/${movieId}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                    More Info
                    </a>
                </div>
            </div>
        </div>
    )
}

export default VideoTitle
