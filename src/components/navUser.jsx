import React from 'react'

const NavbarU = () => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:fixed md:bottom-auto md:left-auto md:right-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0">
      <nav className="flex md:flex-col items-center gap-2 bg-white/90 backdrop-blur-xl shadow-lg border border-gray-200/60 rounded-2xl p-2">

        {/* HOME */}
        <a href="/" className="group relative w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
            className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="absolute -top-8 md:-top-0 md:-left-20 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Home</span>
        </a>

        {/* PROFILE */}
        <a href="/login_user" className="group relative w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
            className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="absolute -top-8 md:-top-0 md:-left-20 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Profile</span>
        </a>

      </nav>
    </div>
  )
}

export default NavbarU
