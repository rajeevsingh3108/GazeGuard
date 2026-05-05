import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

function FaceOrientationChecker({ username, testCode }) {
  const [status, setStatus] = useState('Initializing...');
  const [sentiment, setSentiment] = useState('Unknown');
  const [warningCount, setWarningCount] = useState(0);
  const [warningMsg, setWarningMsg] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);
  const [warningType, setWarningType] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastWarningTime = useRef(0);
  const warningCountRef = useRef(0);
  const kickedOutRef = useRef(false);

  // ── Throttled warning handler ──────────────────────────────────────────────
  const handleWarning = useCallback((msg, type = 'proctoring') => {
    if (!msg || kickedOutRef.current) return;

    const now = Date.now();
    if (now - lastWarningTime.current < 6000) return;
    lastWarningTime.current = now;

    setWarningMsg(msg);
    setWarningType(type);
    setShowWarningModal(true);

    // Persist client-side warnings (tab switch, copy/paste) to backend
    if (type !== 'proctoring' && username && testCode) {
      axios.post('http://localhost:5000/log-warning', {
        username,
        testCode,
        warningType: msg
      }).catch(() => {/* silent */});
    }

    warningCountRef.current += 1;
    const newCount = warningCountRef.current;
    setWarningCount(newCount);

    if (newCount >= 3) {
      kickedOutRef.current = true;
      setKickedOut(true);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      setTimeout(() => { window.location.href = '/login_user'; }, 5000);
    } else {
      setTimeout(() => setShowWarningModal(false), 4000);
    }
  }, [username, testCode]);

  // ── Camera + proctoring interval ───────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(err => console.error('Webcam error:', err));

    const sendFrame = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.videoWidth === 0 || kickedOutRef.current) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);

      canvas.toBlob(blob => {
        const fd = new FormData();
        fd.append('frame', blob, 'frame.jpg');
        if (username) fd.append('username', username);
        if (testCode) fd.append('testCode', testCode);

        axios.post('http://localhost:5000/face-orientation', fd)
          .then(res => {
            const { status: s, sentiment: sent, warning } = res.data;
            setStatus(s || 'Unknown');
            if (sent) setSentiment(sent);
            // Only trigger a warning if the backend says something is wrong
            if (warning) {
              // Silent logging for specific infractions (Admin only)
              // These will not count towards session termination
              if (warning.includes('Multiple Faces') || 
                  warning.includes('Device Detected') || 
                  warning.includes('No Face Detected') || 
                  warning.includes('Looking Away')) {
                // The backend already logs these to the DB; we keep it silent for the student
                console.log('Silent Proctoring Log:', warning);
              } else {
                handleWarning(warning, 'proctoring');
              }
            }
          })
          .catch(() => {/* silent – backend may be restarting */});
      }, 'image/jpeg', 0.7);
    };

    const interval = setInterval(sendFrame, 2000); // every 2s — balanced
    return () => clearInterval(interval);
  }, [handleWarning, username, testCode]);

  // ── Tab-switch / window-blur detection ────────────────────────────────────
  useEffect(() => {
    const onBlur = () => handleWarning('Tab Switch Detected — Do not leave the exam window', 'tab');
    const onVisibilityChange = () => {
      if (document.hidden) handleWarning('Tab Switch Detected — Do not leave the exam window', 'tab');
    };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [handleWarning]);

  // ── Copy-paste detection ───────────────────────────────────────────────────
  useEffect(() => {
    const onCopy = (e) => { e.preventDefault(); handleWarning('Copy Detected — Copying is not allowed during the exam', 'copy'); };
    const onPaste = (e) => { e.preventDefault(); handleWarning('Paste Detected — Pasting is not allowed during the exam', 'paste'); };
    const onCut = (e) => { e.preventDefault(); handleWarning('Cut Detected — Cutting is not allowed during the exam', 'cut'); };
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
    };
  }, [handleWarning]);

  // ── Right-click block ─────────────────────────────────────────────────────
  useEffect(() => {
    const onContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, []);

  const getStatusColor = () => {
    if (status === 'Facing Camera') return 'bg-green-500';
    if (status === 'No Face Detected' || status === 'Multiple Faces') return 'bg-red-500';
    if (status === 'Face Turned Away') return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const getWarningIcon = () => {
    if (warningType === 'tab') return '🔕';
    if (warningType === 'copy' || warningType === 'paste' || warningType === 'cut') return '📋';
    if (warningMsg?.includes('Device')) return '📱';
    if (warningMsg?.includes('Multiple')) return '👥';
    return '👁️';
  };

  return (
    <div className="w-full p-3 rounded-xl shadow-xl bg-white/80 backdrop-blur-md border border-gray-200 flex flex-col items-center space-y-3">

      {/* Status Header */}
      <div className="flex items-center space-x-3 w-full justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`}></span>
          <span className="text-sm font-Orbitron font-semibold text-gray-700">Live Proctoring</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${warningCount === 0 ? 'bg-green-100 text-green-700' : warningCount === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          ⚠ {warningCount}/3 Warnings
        </span>
      </div>

      {/* Video Box */}
      <div className="w-full h-44 bg-black rounded-lg overflow-hidden shadow-lg relative">
        <video ref={videoRef} className="w-full h-full object-cover" muted />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center py-1">
          <span className={`text-xs font-bold font-Orbitron ${status === 'Facing Camera' ? 'text-green-400' : 'text-red-400'}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Sentiment */}
      <p className="text-xs font-Lex text-gray-500 w-full text-center capitalize bg-gray-50 rounded-lg py-1 px-2">
        Sentiment: <span className="font-bold text-indigo-600">{sentiment}</span>
      </p>

      {/* ── GazeGuard Warning Modal ─────────────────────────────────────────── */}
      {showWarningModal && !kickedOut && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-6 pointer-events-none">
          <div className="pointer-events-auto animate-[slideDown_0.3s_ease-out] bg-white border-l-4 border-red-500 rounded-2xl shadow-2xl w-[420px] overflow-hidden">
            {/* Header bar */}
            <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-black text-sm">GG</span>
                </div>
                <span className="text-white font-Orbitron font-bold text-sm tracking-wider">GazeGuard Proctoring</span>
              </div>
              <span className="text-white/80 text-xs font-mono">ALERT #{warningCount}</span>
            </div>
            {/* Body */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{getWarningIcon()}</span>
                <div>
                  <p className="text-gray-900 font-bold text-base leading-snug">{warningMsg}</p>
                  <p className="text-gray-500 text-sm mt-1">This incident has been logged and reported to your administrator.</p>
                </div>
              </div>
              {/* Warning progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Warning Progress</span>
                  <span className="font-bold text-red-600">{warningCount} / 3</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${warningCount === 1 ? 'bg-yellow-400' : warningCount === 2 ? 'bg-orange-500' : 'bg-red-600'}`}
                    style={{ width: `${(warningCount / 3) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-red-500 mt-1 font-semibold">
                  {3 - warningCount === 0 ? 'Session will be terminated!' : `${3 - warningCount} more warning(s) before termination`}
                </p>
              </div>
            </div>
            {/* Footer */}
            <div className="bg-gray-50 border-t px-5 py-2 flex justify-between items-center">
              <span className="text-xs text-gray-400">Dismiss in a few seconds...</span>
              <button
                onClick={() => setShowWarningModal(false)}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Termination Modal ──────────────────────────────────────────────── */}
      {kickedOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl text-center max-w-lg w-full mx-4 overflow-hidden">
            <div className="bg-red-600 py-6 px-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-black text-2xl">GG</span>
              </div>
              <h2 className="text-3xl font-Orbitron font-black text-white tracking-widest">SESSION TERMINATED</h2>
              <p className="text-red-200 text-sm mt-1 font-Lex">GazeGuard Proctoring System</p>
            </div>
            <div className="p-8">
              <p className="text-gray-800 font-bold text-lg mb-3">Maximum Warnings Reached (3/3)</p>
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-5">
                <p className="text-red-700 text-sm leading-relaxed">
                  Your examination session has been permanently terminated due to repeated academic integrity violations. This incident has been recorded and reported to your administrator.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to login...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaceOrientationChecker;
