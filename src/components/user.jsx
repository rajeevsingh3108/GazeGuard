
import { React, useEffect } from 'react';
import NavbarU from './navUser';
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/logoexam.jpg'
import Ut2 from "./underline2"
import Marquee from "./textloop"

const User = () => {

  const navigate = useNavigate();
  const startTest = () => {
    navigate('/user_test', { state: { username } });
  };

  const location = useLocation();
  const username = location.state?.username;

  useEffect(() => {
    if (!username) {
      navigate("/login_user");
    }
  }, [username, navigate]);

  const handleLogout = () => {
    navigate('/login_user');
  };

  return (
    <>
      <div className="min-h-screen flex bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative">

        {/* 🔹 Top-left Logo */}
        <div className="absolute top-4 left-4 flex items-center space-x-3">
          <img className="w-14 h-14 rounded-full shadow-md" alt="Logo" src={logo} />
          <h1 className="font-Zen font-bold text-3xl tracking-wide text-slate-700 drop-shadow-lg">GazeGuard</h1>
        </div>

        {/* 🔹 Sidebar */}
        <aside className="
          w-[380px] lg:w-[420px] 
          h-full 
          bg-white/60 backdrop-blur-xl 
          border-r border-white/30 
          shadow-xl 
          p-8 
          flex flex-col items-center 
          fixed left-0 top-0
        ">
          <div className="flex flex-col items-center mt-20">

            {/* Profile image */}
            <img
              className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-blue-600"
              src="https://i.pinimg.com/originals/59/af/9c/59af9cd100daf9aa154cc753dd58316d.jpg"
              alt="Profile"
            />

            {/* Username */}
            <h2 className="text-3xl font-Lex font-bold text-gray-800 mt-6">{username}</h2>
            <p className="text-sm text-gray-500 font-Lex">Student</p>
          </div>

          {/* Logout button */}
          <nav className="mt-10 w-full px-4">
            <button
              onClick={handleLogout}
              className="w-full py-3
                         bg-red-500/10 text-red-600 
                         font-Orbitron font-semibold
                         rounded-lg 
                         hover:bg-red-500 hover:text-white 
                         transition-all duration-300 shadow-sm"
            >
              Log Out
            </button>
          </nav>
        </aside>

        {/* 🔹 Main Content */}
        <main className="flex-1 ml-[380px] lg:ml-[420px] flex flex-col items-center justify-center p-10">
          
          <div className="max-w-2xl w-full flex flex-col items-center space-y-10">

            {/* Animated banner */}
            <Marquee />

            {/* Divider */}
            <Ut2 />

            {/* Instructions */}
            <p className="text-gray-700 text-xl text-center max-w-xl leading-relaxed font-Mont">
              Click on the button below to start your examination.  
              Please ensure a stable network connection and follow all proctoring guidelines carefully.
            </p>

            {/* Start Exam Button */}
            <button
              className="px-14 py-4 
                         bg-blue-600 text-white 
                         rounded-full 
                         font-Orbitron text-xl tracking-wide 
                         shadow-lg 
                         hover:bg-blue-700 
                         hover:shadow-xl 
                         active:scale-95
                         transition-all duration-300"
              onClick={startTest}
            >
              Start Exam
            </button>
          </div>

        </main>

        {/* Bottom Navbar */}
        <NavbarU />
      </div>
    </>
  );
};

export default User;
