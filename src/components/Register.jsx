import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logoexam.jpg'

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role as 'user'
  const [error, setError] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFace = (e) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setFaceImage(dataUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'user' && !faceImage) {
      setError('Please capture your face before registering.');
      return;
    }

    // Send a POST request to register the user
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role, face_image: faceImage }),
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
    <div className="min-h-screen bg-mesh bg-dots flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <a href="/" className="flex items-center gap-3 mb-10 group">
        <img className="w-10 h-10 rounded-xl shadow-sm" alt="Logo" src={logo} />
        <span className="font-bold text-xl text-gray-900 tracking-tight">
          Gaze<span className="text-indigo-600">Guard</span>
        </span>
      </a>

      {/* Card */}
      <div className="w-full max-w-[440px] card p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-sm text-gray-500">Join GazeGuard to start taking proctored exams</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-premium"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setFaceImage(null); }}
              className="input-premium !cursor-pointer"
            >
              <option value="user">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          {role === 'user' && (
            <div className="mt-2 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Face Verification</label>
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
                <video ref={videoRef} autoPlay muted className="w-full h-48 object-cover" />
                {faceImage && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                    <span className="badge badge-emerald !text-sm !px-4 !py-2 shadow-lg">
                      ✓ Face Captured
                    </span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              <button 
                onClick={captureFace} 
                className="btn-secondary w-full !py-2.5 !rounded-xl !text-sm"
              >
                {faceImage ? '📸 Recapture Face' : '📸 Capture Face'}
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full !py-3.5 !rounded-xl">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login_user" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;