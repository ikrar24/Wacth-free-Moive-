import React from 'react'
import SearchBar from './Components/SearchBar'
import { Route , Routes } from 'react-router-dom'
import VideoContent from './Pages/VideoContent'

function App() {
  return (
    <div className='bg-black w-screen h-auto flex items-center justify-center'>
      <div className="w-[95%] h-full flex items-center flex-col">
        {/* here content */}
        <Routes>
          <Route path='/' element={<SearchBar/>} />
          <Route path='/video-play/:id' element={<VideoContent/>} />
        </Routes>
      </div>
    </div>
  )
}

export default App
