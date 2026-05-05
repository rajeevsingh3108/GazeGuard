import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logoexam.jpg";
import Ut2 from "./underline2";
import Marquee from "./textloop";

const Admin = () => {
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testCode, setTestCode] = useState('');
  const location = useLocation();
  const username = location.state?.username;
  const navigate = useNavigate();

  // Redirect if logged out
  useEffect(() => {
    if (!username) navigate("/login_admin");
  }, [username, navigate]);

  // Modal controls
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleTestCodeChange = (e) => setTestCode(e.target.value);

  const startTest = () => {
    navigate('/test-page', { state: { testCode } });
    closeModal();
  };

  const handleLogout = () => navigate('/login_admin');

  return (
    <>
      {/* PAGE LAYOUT */}
      <div className="min-h-screen flex bg-slate-100">

        {/* LEFT SIDEBAR */}
        <aside className="w-[330px] bg-white shadow-xl border-r border-gray-200 hidden md:flex flex-col items-center py-8">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <img 
              className="w-14 h-14 rounded-full shadow" 
              alt="Logo" 
              src={logo} 
            />
            <h1 className="font-Zen text-3xl text-gray-900 tracking-wide">
              GazeGuard
            </h1>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center text-center">
            <img
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-xl"
              src="https://i.pinimg.com/originals/59/af/9c/59af9cd100daf9aa154cc753dd58316d.jpg"
              alt="Profile"
            />

            <h2 className="text-2xl font-Lex font-bold text-gray-800 mt-4">
              {username}
            </h2>

            <p className="text-gray-500 font-Lex text-sm">Admin</p>
          </div>

          {/* Buttons */}
          <nav className="mt-10 w-full px-10">
            <button
              onClick={handleLogout}
              className="
                w-full py-3 
                bg-red-100 text-red-600 
                rounded-lg font-Orbitron 
                hover:bg-red-200 transition shadow-sm
              "
            >
              Log Out
            </button>
          </nav>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="md:hidden flex justify-between items-center bg-white shadow p-4 w-full">
          <img className="w-12 h-12 rounded-full" src={logo} alt="Logo" />
          <h1 className="font-Zen text-2xl">GazeGuard</h1>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">

          <Marquee />
          <Ut2 />

          <p className="text-gray-600 text-lg max-w-md font-Mont mt-4">
            Click below to create your exam.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button
              onClick={openModal}
              className="
                px-12 py-4 
                bg-blue-600 text-white 
                font-Orbitron text-lg 
                rounded-full shadow-md 
                hover:bg-blue-700 transition
              "
            >
              Create MCQ Test
            </button>

            <button
              onClick={() => navigate('/admin-coding')}
              className="
                px-12 py-4 
                bg-indigo-600 text-white 
                font-Orbitron text-lg 
                rounded-full shadow-md 
                hover:bg-indigo-700 transition
              "
            >
              Create Coding Test
            </button>
          </div>
        </main>

        {/* Bottom Navbar (Mobile) */}
        <Navbar />
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-sm shadow-xl rounded-xl p-6 border border-gray-200 animate-fadeIn">

            <h2 className="text-2xl font-Orbitron font-bold text-gray-900 mb-4">
              Create Test
            </h2>

            <input
              type="text"
              value={testCode}
              onChange={handleTestCodeChange}
              placeholder="Enter test code"
              className="
                w-full p-3 
                border border-gray-300 rounded-lg 
                font-Lex text-gray-700 
                focus:ring-2 focus:ring-blue-400 outline-none
              "
            />

            <div className="flex justify-end gap-4 mt-5">

              <button
                onClick={closeModal}
                className="
                  px-4 py-2 
                  bg-gray-200 
                  rounded-lg shadow-sm 
                  hover:bg-gray-300 
                  font-Orbitron
                "
              >
                Cancel
              </button>

              <button
                onClick={startTest}
                className="
                  px-4 py-2 
                  bg-blue-600 text-white 
                  rounded-lg shadow-md 
                  hover:bg-blue-700 
                  font-Orbitron
                "
              >
                Start Test
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
