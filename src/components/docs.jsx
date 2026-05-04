import React from 'react'
import Underline from "./underline"
import logo from '../assets/logoexam.jpg'

const Docs = () => {
  return (
    <>
      {/* TOP NAVBAR */}
      <div className="flex justify-between items-center bg-white/70 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50 border-b border-gray-200">

        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <img 
            className="w-14 h-14 rounded-full shadow-md"
            alt="Logo" 
            src={logo}
          />
          <h1 className="font-Zen font-semibold text-3xl text-gray-800 tracking-wide">
            GazeGuard
          </h1>
        </div>

        {/* NAV BUTTONS */}
        <div className="flex items-center gap-4">
          <a href="/login_user">
            <button className="
              px-6 py-2 
              border-2 border-blue-500 text-blue-600 
              rounded-xl 
              font-medium
              transition-all duration-300 
              hover:bg-blue-600 hover:text-white 
              shadow-md hover:shadow-blue-300
            ">
              Login User
            </button>
          </a>

          <a href="/login_admin">
            <button className="
              px-6 py-2 
              border-2 border-blue-500 text-blue-600 
              rounded-xl 
              font-medium
              transition-all duration-300 
              hover:bg-blue-600 hover:text-white 
              shadow-md hover:shadow-blue-300
            ">
              Login Admin
            </button>
          </a>

          <a href="/register">
            <button className="
              px-6 py-2 
              border-2 border-blue-500 text-blue-600 
              rounded-xl 
              font-medium
              transition-all duration-300 
              hover:bg-blue-600 hover:text-white 
              shadow-md hover:shadow-blue-300
            ">
              Sign-up
            </button>
          </a>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex flex-col justify-center items-center text-center min-h-screen bg-slate-100 bg-custom-pattern px-6">

        <img 
          className="w-24 h-24 rounded-full shadow-lg mb-4"
          alt="Logo" 
          src={logo} 
        />

        <h1 className="
          font-Zen 
          text-6xl md:text-7xl 
          text-gray-800 
          mb-5 
          transition-transform duration-300 hover:scale-110
        ">
          Welcome to GazeGuard
        </h1>

        <Underline />

        <ul className="list-disc list-inside mt-10 space-y-4 font-mono text-lg md:text-xl text-gray-700 max-w-3xl leading-relaxed">
          <li>Prevents copying, pasting, and right-clicking to block unfair methods.</li>
          <li>Tracks and limits tab switching, issuing warnings when limits are crossed.</li>
          <li>Repeated violations lead to auto-submission and exam termination.</li>
          <li>Admins can create tests, monitor violations, and track student activity in real-time.</li>
        </ul>
      </div>
    </>
  )
}

export default Docs
