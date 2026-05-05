
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function FaceOrientationChecker({ username, testCode }) {
  const [status, setStatus] = useState('Unknown');
  const [sentiment, setSentiment] = useState('Unknown');
  const [warningCount, setWarningCount] = useState(0);
  const [warningMsg, setWarningMsg] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastWarningTime = useRef(0);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(error => console.error('Error accessing webcam:', error));

    const handleWarning = (msg) => {
      if (!msg) return;
      
      const now = Date.now();
      // Throttle warnings to once every 5 seconds to avoid instant kick
      if (now - lastWarningTime.current < 5000) {
        return;
      }
      lastWarningTime.current = now;
      
      setWarningMsg(msg);
      setShowWarningModal(true);
      
      setWarningCount(prevCount => {
        const newCount = prevCount + 1;
        if (newCount >= 3) {
          alert("Maximum warnings (3) reached. The assessment will now close.");
          window.location.href = '/login_user';
        }
        return newCount;
      });
      
      setTimeout(() => setShowWarningModal(false), 3000);
    };

    const sendFrameToServer = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video || video.videoWidth === 0) return;

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
            if (response.data.warning) {
              handleWarning(response.data.warning);
            } else if (response.data.status === "Face Turned Away") {
              // Optionally log turning away as a warning
              handleWarning("Face Turned Away");
            }
          })
          .catch(error => console.error('Error sending frame:', error));
      }, 'image/jpeg');
    };

    const verifyFace = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');
        if (username) formData.append('username', username);
        if (testCode) formData.append('testCode', testCode);

        axios.post('http://localhost:5000/verify-face', formData)
          .then(response => {
            if (response.data.warning) {
               handleWarning(response.data.warning);
            }
          })
          .catch(error => console.error('Error verifying face:', error));
      }, 'image/jpeg');
    };

    const interval = setInterval(sendFrameToServer, 1000);
    const verifyInterval = setInterval(verifyFace, 15000); // Verify every 15 seconds
    
    // Call verify immediately after a short delay
    setTimeout(verifyFace, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(verifyInterval);
    };
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
      
      {warningMsg && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2">
          <strong className="font-bold">Last Warning: </strong>
          <span className="block sm:inline">{warningMsg} (Count: {warningCount}/3)</span>
        </div>
      )}

      {/* Full Screen Warning Popup */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/80 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform scale-110 animate-bounce">
            <h2 className="text-4xl font-bold text-red-600 mb-4">⚠️ WARNING ⚠️</h2>
            <p className="text-2xl font-semibold text-gray-800">{warningMsg}</p>
            <p className="text-lg text-gray-600 mt-2">Please rectify this immediately.</p>
            <p className="text-xl font-bold text-red-500 mt-4">Warning {warningCount} of 3</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaceOrientationChecker;
