import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logoexam.jpg'

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role as 'user'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send a POST request to register the user
    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      // Successful registration, redirect to login page
      if (role === 'user'){
        navigate('/login_user');
      }
      else{
        navigate('/login_admin');
      }
    } else {
      // Display error message
      setError(data.message || 'Registration failed');
    }
  };

  return (
    <div className = "flex flex-col justify-center items-center min-h-screen bg-white text-gray-200 ">
       <img className=" w-24 h-24 rounded-full m-8" alt="Logo" src={logo}>
        </img>
        <h1 className="font-Zen font-medium text-end text-3xl mb-2 text-black  ">GazeGuard</h1>
      <div className = "flex flex-col justify-center items-center  bg-gray-100 p-8 rounded-lg">

      
      <h1 className="mb-8 font-medium text-2xl  text-black font-Orbitron ">Register</h1>
      <form onSubmit={handleSubmit}>
        <div className = "mb-2 font-Lex ">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="mb-4 w-80 p-2 rounded-lg text-slate-950 border-black "
          />
        </div>
        <div className="mb-2 font-Lex">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="mb-4 w-80 p-2 rounded-lg text-slate-950 border-black"
          />
        </div>
        <div className="mb-0 font-Lex text-black">
          <label htmlFor="role   ">Select Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg p-2 text-slate-950"
          >
            <option value="user" className='text-slate-950'>User</option>
            <option value="admin"className="text-slate-950">Admin</option>
          </select>
        </div>
        <button
          type="submit"
         className="mt-8 w-full rounded-md bg-black py-2 text-white font-semibold hover:bg-indigo-950 font-Orbitron"
        >
          Register
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
    </div>
    </div>
  );
}

export default Register;