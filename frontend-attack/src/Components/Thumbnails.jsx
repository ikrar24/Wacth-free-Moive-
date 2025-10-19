import React from 'react'

function Thumbnails({thumbnailSrc}) {
  return (
    <div className=" relative w-full h-full " >

    <img src={thumbnailSrc} alt="Thumbnail" className="w-full h-full object-cover "  />

<div className=" absolute top-0 left-0 w-full h-full bg-black/60 " ></div>

</div>
  )
}

export default Thumbnails
