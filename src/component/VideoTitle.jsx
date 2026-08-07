import React from 'react'

const VideoTitle = ({title,description}) => {
  return (
    <div className='align-middle px-10 absolute z-10 text-white bg-gradient-to-r from-black w-screen aspect-video'>
      <div className='pt-36 px-12'>
        <h1 className='text-6xl py-4 font-bold align-middle' >{title}</h1>
        <p className='w-1/3'>{description}</p>
        <div>
        <button>Play</button>
        <button>More Info</button>
      </div>
      </div>
    </div>
  )
}

export default VideoTitle
