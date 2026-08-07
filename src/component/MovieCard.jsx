import React from 'react'
import { IMG_POSTER_URL } from '../utlis/constant'

const MovieCard = ({movieposter}) => {
    

  return (
      <div className=' m-2  w-40'>
        <img className="" src={IMG_POSTER_URL + movieposter} alt="test"></img>
      </div>

  )
}

export default MovieCard
