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

    // Send a POST request to log in
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate("/admin", { state: { username } });
      // Successful login, redirect to the dashboard or admin page
    } else {
      // Display error message
      setError(data.error || "Login failed");
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen  text-gray-200 ">
        <img className=" w-24 h-24 rounded-full m-8" alt="Logo" src={logo}>
        </img>
        <h1 className="font-Zen font-medium text-end text-3xl mb-2 text-black  ">GazeGuard</h1>

        <div className="w-80 rounded-lg bg-gray-100 p-8">
          <p className="text-center text-xl font-bold font-Orbitron text-black">Login</p>
          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="mt-1 text-sm">
              <label htmlFor="username" className="block text-gray-900 font-Lex mb-2">
                Username:
              </label>
              <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-gray-600  px-3 py-2 text-black focus:border-indigo-400 focus:outline-none"
                  required
              />
            </div>
            <div className="mt-4 text-sm">
              <label htmlFor="password" className="block text-black font-Lex  mb-2">
                Password:
              </label>
              <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-600  px-3 py-2 text-black focus:border-indigo-400 focus:outline-none"
                  required
              />
              <div className="flex justify-end mt-2 text-xs text-gray-400">

              </div>
            </div>
            <button
                type="submit"
                className="mt-6 w-full rounded-md bg-black py-2 text-white font-semibold hover:bg-indigo-950"
            >
              Sign in
            </button>
          </form>
          {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        </div>
      </div>
  );
};

export default Login_admin;
