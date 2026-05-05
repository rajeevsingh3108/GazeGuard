
import { React, useEffect } from 'react';
import NavbarU from './navUser';
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../assets/logoexam.jpg'

const User = () => {

  const navigate = useNavigate();
  const startTest = () => {
    navigate('/user_test', { state: { username } });
  };

  const startCodingTest = () => {
    navigate('/user-coding-test', { state: { username } });
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
      <div className="min-h-screen flex bg-slate-50">

        {/* Sidebar */}
        <aside className="w-[300px] h-screen bg-white border-r border-gray-200 hidden md:flex flex-col items-center py-10 px-6 fixed left-0 top-0">

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
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 p-[3px]">
                <img
                  className="w-full h-full rounded-[13px] object-cover bg-white"
                  src="https://i.pinimg.com/originals/59/af/9c/59af9cd100daf9aa154cc753dd58316d.jpg"
                  alt="Profile"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[3px] border-white"></div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-5">{username}</h2>
            <span className="badge badge-emerald mt-2">Student</span>
          </div>

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

        {/* Main Content */}
        <main className="flex-1 md:ml-[300px] flex flex-col items-center justify-center p-10">
          <div className="max-w-lg w-full flex flex-col items-center text-center">

            <span className="badge badge-emerald !text-sm !px-4 !py-2 mb-6 inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Ready to Begin
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Start Your Exam
            </h1>
            <p className="text-gray-500 text-base max-w-md leading-relaxed mb-10">
              Ensure a stable internet connection and keep your camera on. 
              All activity is monitored during the examination.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                className="btn-primary !px-8 !py-4 !text-base !rounded-2xl shadow-lg shadow-indigo-500/25"
                onClick={startTest}
              >
                📝 Start MCQ Exam
              </button>
              <button
                className="btn-secondary !px-8 !py-4 !text-base !rounded-2xl"
                onClick={startCodingTest}
              >
                💻 Start Coding Exam
              </button>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-4 mt-14 w-full max-w-md">
              {[
                { icon: '🔒', label: 'Secure' },
                { icon: '📸', label: 'Proctored' },
                { icon: '⏱️', label: 'Timed' }
              ].map((item, i) => (
                <div key={i} className="stat-card !p-4 flex flex-col items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <NavbarU />
      </div>
    </>
  );
};

export default User;
