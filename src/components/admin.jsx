import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logoexam.jpg";

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
      <div className="min-h-screen flex bg-slate-50">

        {/* LEFT SIDEBAR */}
        <aside className="w-[300px] bg-white border-r border-gray-200 hidden md:flex flex-col items-center py-10 px-6">

          {/* Logo */}
          <a href="/" className="flex items-center gap-3 mb-12">
            <img className="w-9 h-9 rounded-lg shadow-sm" alt="Logo" src={logo} />
            <span className="font-bold text-lg text-gray-900 tracking-tight">
              Gaze<span className="text-indigo-600">Guard</span>
            </span>
          </a>

          {/* Profile Section */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-[3px]">
                <img
                  className="w-full h-full rounded-[13px] object-cover bg-white"
                  src="https://i.pinimg.com/originals/59/af/9c/59af9cd100daf9aa154cc753dd58316d.jpg"
                  alt="Profile"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white"></div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-5">{username}</h2>
            <span className="badge badge-indigo mt-2">Administrator</span>
          </div>

          {/* Sidebar Nav */}
          <nav className="mt-10 w-full space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              Dashboard
            </a>
          </nav>

          {/* Logout */}
          <div className="mt-auto w-full">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="md:hidden flex justify-between items-center bg-white border-b border-gray-200 p-4 w-full">
          <div className="flex items-center gap-2">
            <img className="w-8 h-8 rounded-lg" src={logo} alt="Logo" />
            <span className="font-bold text-lg">GazeGuard</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
          <div className="max-w-lg w-full">
            <div className="mb-4">
              <span className="badge badge-indigo !text-sm !px-4 !py-2 mb-6 inline-block">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse inline-block mr-2"></span>
                Exam Control Panel
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Create an Assessment
            </h1>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-10 leading-relaxed">
              Build MCQ or coding assessments with built-in AI proctoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={openModal} className="btn-primary !px-8 !py-4 !text-base !rounded-2xl shadow-lg shadow-indigo-500/25">
                📝 Create MCQ Test
              </button>
              <button onClick={() => navigate('/admin-coding')} className="btn-secondary !px-8 !py-4 !text-base !rounded-2xl">
                💻 Create Coding Test
              </button>
            </div>
          </div>
        </main>

        <Navbar />
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-8 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Create MCQ Test</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Enter a unique test code to identify this assessment</p>

            <input
              type="text"
              value={testCode}
              onChange={handleTestCodeChange}
              placeholder="e.g. MATH-101"
              className="input-premium mb-6"
            />

            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-secondary flex-1 !py-3">
                Cancel
              </button>
              <button onClick={startTest} className="btn-primary flex-1 !py-3">
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
