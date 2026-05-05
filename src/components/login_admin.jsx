import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logoexam.jpg'

const Login_admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, expected_role: "admin" }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate("/admin", { state: { username } });
    } else {
      setError(data.message || data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-mesh bg-dots flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <a href="/" className="flex items-center gap-3 mb-10 group">
        <img className="w-10 h-10 rounded-xl shadow-sm" alt="Logo" src={logo} />
        <span className="font-bold text-xl text-gray-900 tracking-tight">
          Gaze<span className="text-indigo-600">Guard</span>
        </span>
      </a>

      {/* Card */}
      <div className="w-full max-w-[400px] card p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <span className="badge badge-indigo mb-4">Administrator</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h1>
          <p className="text-sm text-gray-500">Sign in to manage exams</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-premium"
              placeholder="Enter admin username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full !py-3.5 !rounded-xl">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login_admin;
