import React from 'react'

const Navbar = () => {
  return (
    <div className="flex flex-col justify-center items-center relative transition-all duration-500 w-20 m-3">

      <article
        className="
          w-full 
          rounded-2xl 
          bg-white/70 
          backdrop-blur-xl 
          shadow-lg 
          border border-gray-300/40 
          p-2 
          flex flex-col 
          items-center
        "
      >

        {/* HOME */}
        <label
          htmlFor="home"
          className="
            w-full h-16 
            rounded-xl 
            border border-gray-200 
            flex items-center justify-center 
            cursor-pointer 
            group 
            mb-3
            hover:bg-gray-100 
            transition-all duration-300
          "
        >
          <input type="radio" name="nav" id="home" className="hidden" />

          {/* Tooltip */}
          <div className="
            absolute left-20 
            opacity-0 group-hover:opacity-100 
            bg-black/70 text-white 
            px-3 py-1 
            rounded-lg 
            text-xs 
            transition-opacity duration-300
            pointer-events-none
          ">
            Home
          </div>

          <a href="/" className="text-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"
              className="w-7 h-7 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 
                1.591 0L21.75 12M4.5 9.75v10.125c0 
                .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 
                1.125-1.125h2.25c.621 0 1.125.504 
                1.125 1.125V21h4.125c.621 0 
                1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </a>
        </label>



        {/* PROFILE */}
        <label
          htmlFor="profile"
          className="
            w-full h-16 
            rounded-xl 
            border border-gray-200 
            flex items-center justify-center 
            cursor-pointer 
            group 
            mb-3
            hover:bg-gray-100 
            transition-all duration-300
          "
        >
          <input type="radio" name="nav" id="profile" className="hidden" />

          <div className="
            absolute left-20 
            opacity-0 group-hover:opacity-100 
            bg-black/70 text-white 
            px-3 py-1 
            rounded-lg 
            text-xs 
            transition-opacity duration-300
            pointer-events-none
          ">
            Profile
          </div>

          <a href="/admin">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="28" height="28" viewBox="0 0 24 24"
              className="text-gray-800 group-hover:text-blue-600 group-hover:scale-110 transition-all">
              <path
                d="M12 2a5 5 0 1 0 5 5 
                5 5 0 0 0-5-5zm0 8a3 3 
                0 1 1 3-3 3 3 0 0 
                1-3 3zm9 11v-1a7 7 0 0 
                0-7-7h-4a7 7 0 0 0-7 
                7v1h2v-1a5 5 0 0 1 5-5h4a5 
                5 0 0 1 5 5v1z"
              />
            </svg>
          </a>
        </label>



        {/* DASHBOARD */}
        <label
          htmlFor="dashboard"
          className="
            w-full h-16 
            rounded-xl 
            border border-gray-200 
            flex items-center justify-center 
            cursor-pointer 
            group 
            mb-3
            hover:bg-gray-100 
            transition-all duration-300
          "
        >
          <input type="radio" name="nav" id="dashboard" className="hidden" />

          <div className="
            absolute left-20 opacity-0 group-hover:opacity-100
            bg-black/70 text-white
            px-3 py-1 rounded-lg text-xs
            transition-opacity duration-300
            pointer-events-none
          ">
            Dashboard
          </div>

          <a href="/dashboard">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="28" height="28" viewBox="0 0 24 24"
              className="text-gray-800 group-hover:text-blue-600 group-hover:scale-110 transition-all">
              <path
                d="M4 13h6a1 1 0 0 0 1-1V4a1 1 
                0 0 0-1-1H4a1 1 0 0 
                0-1 1v8a1 1 0 0 0 1 1zm-1 
                7a1 1 0 0 0 1 1h6a1 1 
                0 0 0 1-1v-4a1 1 0 0 
                0-1-1H4a1 1 0 0 0-1 
                1v4zm10 0a1 1 0 0 0 1 
                1h6a1 1 0 0 0 1-1v-7a1 1 
                0 0 0-1-1h-6a1 1 0 0 
                0-1 1v7zm1-10h6a1 1 0 0 
                0 1-1V4a1 1 0 0 0-1-1h-6a1 1 
                0 0 0-1 1v5a1 1 0 0 
                0 1 1z"
              />
            </svg>
          </a>
        </label>



        {/* ALERTS */}
        <label
          htmlFor="alerts"
          className="
            w-full h-16 
            rounded-xl 
            border border-gray-200 
            flex items-center justify-center 
            cursor-pointer 
            group 
            hover:bg-gray-100 
            transition-all duration-300
          "
        >
          <input type="radio" name="nav" id="alerts" className="hidden" />

          <div className="
            absolute left-20 opacity-0 group-hover:opacity-100
            bg-black/70 text-white
            px-3 py-1 rounded-lg text-xs
            transition-opacity duration-300
            pointer-events-none
          ">
            Alerts
          </div>

          <a href="#Alerts">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="28" height="28" viewBox="0 0 24 24"
              className="text-gray-800 group-hover:text-blue-600 group-hover:scale-110 transition-all">
              <path
                d="M11.953 2C6.465 2 2 6.486 2 12s4.486 
                10 10 10 10-4.486 10-10S17.493 
                2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 
                7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 
                8z"
              />
              <path d="M11 7h2v7h-2zm0 8h2v2h-2z" />
            </svg>
          </a>
        </label>


      </article>
    </div>
  )
}

export default Navbar
