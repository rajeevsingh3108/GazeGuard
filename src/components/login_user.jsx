import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import logo from '../assets/logoexam.jpg'

const Login_user = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, expected_role: 'user' }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate(data.redirect, { state: { username } });
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-200 ">
        <img className=" w-24 h-24 rounded-full m-8" alt="Logo" src={logo}>
        </img>
        <h1 className="font-Zen font-medium text-end text-3xl mb-2 text-black  ">GazeGuard</h1>

      <div className="w-80 rounded-lg bg-gray-100 p-8 shadow-xl">
        <p className="text-center text-xl font-bold text-black font-Orbitron">Login</p>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="mt-1 text-sm">
            <label htmlFor="username" className="block text-gray-900 font-Lex ">
              Username:
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-black bg-white px-3 py-2 text-black focus:border-indigo-400 focus:outline-none"
            />
          </div>
          <div className="mt-4 text-sm">
            <label htmlFor="password" className="block text-gray-900 font-Lex">
              Password:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black bg-white px-3 py-2 text-black focus:border-indigo-400 focus:outline-none"
            />
            <div className="flex justify-end mt-2 text-xs text-gray-400">

            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-black py-2 text-white font-semibold hover:bg-indigo-950 font-Orbitron"
          >
            Sign in
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        <p className="mt-4 text-center text-xs text-black font-Lex">
          Don&apos;t have an account?{" "}
          <a href="/Register" className="text-black hover:underline hover:text-indigo-600 ">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login_user;
