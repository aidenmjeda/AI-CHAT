import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Loading = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/')
    }, 8000)

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div
      className='flex items-center justify-center h-screen w-screen text-white text-2xl'
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #014421, #002b13)', // dark royal green tones
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className='w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin shadow-lg shadow-emerald-700'></div>
    </div>
  )
}

export default Loading
