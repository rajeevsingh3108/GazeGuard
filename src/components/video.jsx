
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function FaceOrientationChecker({ username, testCode }) {
  const [status, setStatus] = useState('Unknown');
  const [sentiment, setSentiment] = useState('Unknown');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(error => console.error('Error accessing webcam:', error));

    const sendFrameToServer = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');
        if (username) formData.append('username', username);
        if (testCode) formData.append('testCode', testCode);

        axios.post('http://localhost:5000/face-orientation', formData)
          .then(response => {
            setStatus(response.data.status);
            if (response.data.sentiment) setSentiment(response.data.sentiment);
          })
          .catch(error => console.error('Error sending frame:', error));
      }, 'image/jpeg');
    };

    const interval = setInterval(sendFrameToServer, 1000);
    return () => clearInterval(interval);
  }, []);

  /* Color badge based on status */
  const getStatusColor = () => {
    if (status === "Facing Camera") return "bg-green-500";
    if (status === "Face Turned Away") return "bg-red-500";
    return "bg-gray-400";
  };

  return (
    <div className="w-full p-3 rounded-xl shadow-xl 
                    bg-white/80 backdrop-blur-md border border-gray-200 
                    flex flex-col items-center space-y-3">

      {/* 🔹 Status Header */}
      <div className="flex items-center space-x-3">
        <span className={`w-4 h-4 rounded-full animate-pulse ${getStatusColor()}`}></span>
        <h1 className="text-xl font-Orbitron font-semibold text-gray-700">
          Face Orientation
        </h1>
      </div>

      {/* 🔹 Video Box */}
      <div className="w-full h-52 bg-black rounded-lg overflow-hidden shadow-lg">
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 🔹 Status Text */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <p className="text-lg font-Lex font-semibold 
                   text-gray-700 bg-gray-100 px-4 py-2 rounded-lg shadow-sm w-full text-center">
          {status}
        </p>
        <p className="text-lg font-Lex font-semibold 
                   text-white bg-indigo-500 px-4 py-2 rounded-lg shadow-sm w-full text-center capitalize">
          Sentiment: {sentiment}
        </p>
      </div>

      {/* 🔹 Warning Message */}
      {status === 'Face Turned Away' && (
        <p className="text-red-600 text-xl font-Orbitron animate-pulse">
          Please face the screen!
        </p>
      )}
    </div>
  );
}

export default FaceOrientationChecker;
