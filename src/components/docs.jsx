import React from 'react'
import Underline from "./underline"
import logo from '../assets/logoexam.jpg'

const Docs = () => {
  return (
    <>
      {/* TOP NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo + Name */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                className="w-10 h-10 rounded-xl shadow-sm"
                alt="GazeGuard" 
                src={logo}
              />
              <div className="absolute -inset-1 rounded-xl bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Gaze<span className="text-indigo-600">Guard</span>
            </span>
          </a>

          {/* NAV BUTTONS */}
          <div className="flex items-center gap-3">
            <a href="/login_user">
              <button className="btn-secondary !py-2.5 !px-5 !text-xs !rounded-lg">
                Student Login
              </button>
            </a>
            <a href="/login_admin">
              <button className="btn-secondary !py-2.5 !px-5 !text-xs !rounded-lg">
                Admin Login
              </button>
            </a>
            <a href="/register">
              <button className="btn-primary !py-2.5 !px-5 !text-xs !rounded-lg">
                Sign Up Free
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative min-h-[calc(100vh-73px)] flex flex-col justify-center items-center bg-mesh overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          {/* Badge */}
          <div className="animate-fade-in-up">
            <span className="badge badge-indigo mb-8 inline-flex items-center gap-2 !px-4 !py-2 !text-sm">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              AI-Powered Exam Proctoring
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 animate-fade-in-up animation-delay-200 leading-[1.1]">
            Secure exams with
            <br />
            <span className="gradient-text">intelligent proctoring</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up animation-delay-400">
            GazeGuard uses real-time gaze tracking and facial recognition 
            to ensure exam integrity — automatically and effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
            <a href="/register">
              <button className="btn-primary !px-8 !py-4 !text-base !rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30">
                Get Started →
              </button>
            </a>
            <a href="/login_user">
              <button className="btn-secondary !px-8 !py-4 !text-base !rounded-2xl">
                Take an Exam
              </button>
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 max-w-5xl mx-auto mt-20 px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Anti-Cheat Protection',
                desc: 'Blocks copy/paste, tab switching, and right-clicking during exams.'
              },
              {
                icon: '👁️',
                title: 'Gaze Tracking',
                desc: 'Real-time face orientation detection with instant alerts for violations.'
              },
              {
                icon: '📊',
                title: 'Live Dashboard',
                desc: 'Admins monitor students in real-time with detailed proctoring analytics.'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="card p-8 text-center hover:-translate-y-1 animate-fade-in-up"
                style={{animationDelay: `${0.6 + i * 0.15}s`}}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <div className="relative z-10 mt-16 pb-10">
          <Underline />
        </div>
      </div>
    </>
  )
}

export default Docs
