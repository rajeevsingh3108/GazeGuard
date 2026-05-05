import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Ut3 from "./underline3";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [codingTests, setCodingTests] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  
  const [userDetailsModalVisible, setUserDetailsModalVisible] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    fetchTests();
    fetchUserDetails();
  }, []);

  const fetchTests = () => {
    axios.get('http://localhost:5000/get-all-tests')
      .then(res => setTests(res.data))
      .catch(err => console.error("Error fetching tests!", err));
    
    axios.get('http://localhost:5000/get-all-coding-tests')
      .then(res => setCodingTests(res.data))
      .catch(err => console.error("Error fetching coding tests!", err));
  };

  const fetchUserDetails = () => {
    axios.get('http://localhost:5000/get-all-user-sessions')
      .then(res => {
        const userData = res.data.map(u => ({
          user_name: u.username,
          test_id: u.test_id,
          test_type: u.test_type,
          ip_address: u.ip_address,
          session_login: u.session_login,
          score: u.score,
          total: u.total,
          timestamp: u.timestamp
        }));
        setUserDetails(userData);
      })
      .catch(err => console.error("Error fetching user details!", err));
  };

  const handleStartTest = (testCode) => {
    axios.post('http://localhost:5000/start-test', { testCode })
      .then(() => {
        alert("Test Started!");
        fetchTests();
      })
      .catch(err => console.error("Error starting test", err));
  };

  const handleEndTest = (testCode) => {
    axios.post('http://localhost:5000/end-test', { testCode })
      .then(() => {
        alert("Test Ended!");
        fetchTests();
      })
      .catch(err => console.error("Error ending test", err));
  };

  const handleResetTest = (testCode) => {
    axios.post('http://localhost:5000/reset-test', { testCode })
      .then(() => {
        alert("Test Reset!");
        fetchTests();
      })
      .catch(err => console.error("Error resetting test", err));
  };

  const handleStartCodingTest = (testCode) => {
    axios.post('http://localhost:5000/start-coding-test', { testCode })
      .then(() => {
        alert("Coding Test Started!");
        fetchTests();
      })
      .catch(err => console.error("Error starting coding test", err));
  };

  const handleEndCodingTest = (testCode) => {
    axios.post('http://localhost:5000/end-coding-test', { testCode })
      .then(() => {
        alert("Coding Test Ended!");
        fetchTests();
      })
      .catch(err => console.error("Error ending coding test", err));
  };

  const handleScoreClick = (username, testCode) => {
    axios.get(`http://localhost:5000/get-user-test-details?username=${username}&testCode=${testCode}`)
      .then(res => {
        setSelectedDetails({ username, testCode, ...res.data });
        setUserDetailsModalVisible(true);
      })
      .catch(err => {
        console.error("Error fetching detailed logs", err);
        alert("Could not fetch detailed logs for " + username);
      });
  };

  // Pie chart processing — match new warning message formats
  let faceAwayCount = 0;
  let deviceCount = 0;
  let tabSwitchCount = 0;
  let copyPasteCount = 0;
  let multipleFaceCount = 0;
  let otherWarningCount = 0;

  if (selectedDetails) {
    selectedDetails.logs.forEach(log => {
      if (log.head_orientation === 'Face Turned Away' || log.head_orientation === 'No Face Detected') faceAwayCount++;
      if (log.head_orientation === 'Multiple Faces') multipleFaceCount++;
    });
    selectedDetails.warnings.forEach(w => {
      const wt = w.warning_type || '';
      if (wt.includes('Device') || wt.includes('Phone') || wt.includes('phone')) {
        deviceCount++;
      } else if (wt.includes('Tab Switch') || wt.includes('tab')) {
        tabSwitchCount++;
      } else if (wt.includes('Copy') || wt.includes('Paste') || wt.includes('Cut')) {
        copyPasteCount++;
      } else if (wt.includes('Multiple Faces')) {
        multipleFaceCount++;
      } else if (wt.includes('No Face') || wt.includes('Looking Away') || wt.includes('Face Turned')) {
        faceAwayCount++;
      } else {
        otherWarningCount++;
      }
    });
  }

  const pieData = [
    { name: 'Looked Away / No Face', value: faceAwayCount },
    { name: 'Multiple Faces', value: multipleFaceCount },
    { name: 'Device Detected', value: deviceCount },
    { name: 'Tab Switching', value: tabSwitchCount },
    { name: 'Copy / Paste', value: copyPasteCount },
    { name: 'Other', value: otherWarningCount }
  ].filter(d => d.value > 0);

  const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#6b7280'];

  return (
    <div className="min-h-screen flex bg-slate-100 relative">
      {/* MAIN WRAPPER */}
      <div className="flex flex-col flex-grow items-center w-full py-10 px-4 md:px-12">
        <Ut3 />

        {/* TEST TABLE */}
        <div className="w-full mt-8">
          <div className="bg-white/90 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6">
            <h2 className="text-3xl font-Orbitron font-bold text-gray-800 mb-4">
              Available Tests
            </h2>
            <table className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-md">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-xl">Test Code</th>
                  <th className="p-3 text-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr 
                    key={index}
                    className="text-center text-gray-800 font-medium hover:bg-blue-50 transition"
                  >
                    <td className="p-4 border border-gray-300 text-lg">
                      {test.test_code}
                    </td>
                    <td className="p-3 border border-gray-300 flex flex-col md:flex-row justify-center items-center gap-3">
                      {!test.is_test_started ? (
                        <button
                          onClick={() => handleStartTest(test.test_code)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-Orbitron"
                        >
                          Start Test
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEndTest(test.test_code)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 font-Orbitron"
                        >
                          End Test
                        </button>
                      )}
                      <button
                        onClick={() => handleResetTest(test.test_code)}
                        className="bg-yellow-500 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-600 font-Orbitron"
                      >
                        Reset Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CODING TESTS TABLE */}
        <div className="w-full mt-8">
          <div className="bg-white/90 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6">
            <h2 className="text-3xl font-Orbitron font-bold text-indigo-800 mb-4">
              Available Coding Tests
            </h2>
            <table className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-md">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-xl">Test Code</th>
                  <th className="p-3 text-xl">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codingTests.map((test, index) => (
                  <tr 
                    key={index}
                    className="text-center text-gray-800 font-medium hover:bg-indigo-50 transition"
                  >
                    <td className="p-4 border border-gray-300 text-lg">
                      {test.test_code}
                    </td>
                    <td className="p-3 border border-gray-300 flex flex-col md:flex-row justify-center items-center gap-3">
                      {!test.is_test_started ? (
                        <button
                          onClick={() => handleStartCodingTest(test.test_code)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 font-Orbitron"
                        >
                          Start Test
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEndCodingTest(test.test_code)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 font-Orbitron"
                        >
                          End Test
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {codingTests.length === 0 && (
                  <tr>
                    <td colSpan="2" className="p-6 text-gray-500 font-Mont text-center">
                      No coding tests available. Create one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* USER DETAILS TABLE */}
        <div className="w-full mt-12">
          <div className="bg-white/90 backdrop-blur-md shadow-xl border border-gray-200 rounded-xl p-6">
            <h2 className="text-3xl font-Orbitron font-bold text-gray-800 mb-4">
              User Session Logs
            </h2>
            <table className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-md">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-xl">User Name</th>
                  <th className="p-3 text-xl">Test Code</th>
                  <th className="p-3 text-xl">Type</th>
                  <th className="p-3 text-xl">IP Address</th>
                  <th className="p-3 text-xl">Session Login</th>
                  <th className="p-3 text-xl">Completed At</th>
                  <th className="p-3 text-xl">Score</th>
                </tr>
              </thead>
              <tbody>
                {userDetails.map((user, index) => (
                  <tr
                    key={index}
                    className="text-center font-medium text-gray-800 hover:bg-blue-50 transition"
                  >
                    <td className="p-4 border border-gray-300">{user.user_name}</td>
                    <td className="p-4 border border-gray-300">{user.test_id}</td>
                    <td className="p-4 border border-gray-300">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.test_type === 'MCQ' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {user.test_type}
                      </span>
                    </td>
                    <td className="p-4 border border-gray-300">{user.ip_address}</td>
                    <td className="p-4 border border-gray-300">{user.session_login}</td>
                    <td className="p-4 border border-gray-300 text-sm text-gray-600">{user.timestamp || 'N/A'}</td>
                    <td className="p-4 border border-gray-300">
                      {user.score !== null && user.score !== undefined ? (
                        <button 
                          onClick={() => handleScoreClick(user.user_name, user.test_id)}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline px-3 py-1 rounded"
                        >
                          {user.score} / {user.total}
                        </button>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Navbar />

      {/* DETAILED LOGS MODAL */}
      {userDetailsModalVisible && selectedDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl">
              <h3 className="text-2xl font-Orbitron font-bold text-gray-800">
                Detailed Report - {selectedDetails.username} ({selectedDetails.testCode})
              </h3>
              <button
                onClick={() => setUserDetailsModalVisible(false)}
                className="text-gray-500 hover:text-red-500 transition text-3xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: Stats & Chart */}
              <div className="flex flex-col gap-6">
                
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Total Questions</p>
                    <p className="text-3xl font-bold text-blue-800">{selectedDetails.total}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-purple-600 font-semibold mb-1">Attempted</p>
                    <p className="text-3xl font-bold text-purple-800">{selectedDetails.attempted}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-green-600 font-semibold mb-1">✅ Correct</p>
                    <p className="text-3xl font-bold text-green-800">{selectedDetails.score}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center shadow-sm">
                    <p className="text-xs text-red-600 font-semibold mb-1">❌ Incorrect</p>
                    <p className="text-3xl font-bold text-red-800">{selectedDetails.incorrect}</p>
                  </div>
                </div>
                {/* Score percentage bar */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-gray-600">Score</span>
                    <span className={`font-bold ${selectedDetails.total > 0 && (selectedDetails.score / selectedDetails.total) >= 0.6 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedDetails.total > 0 ? Math.round((selectedDetails.score / selectedDetails.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${selectedDetails.total > 0 && (selectedDetails.score / selectedDetails.total) >= 0.6 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${selectedDetails.total > 0 ? (selectedDetails.score / selectedDetails.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
                  <h4 className="text-lg font-Orbitron font-semibold mb-2">Proctoring Analytics</h4>
                  {pieData.length > 0 ? (
                    <PieChart width={300} height={250}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-400">
                      No Proctoring Infractions
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Logs Table */}
              <div className="flex flex-col gap-6">
                
                {/* Warnings */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm flex-grow">
                  <h4 className="text-lg font-Orbitron font-semibold text-red-700 mb-3">Warnings</h4>
                  {selectedDetails.warnings.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto pr-2">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-red-200 text-red-800">
                            <th className="pb-2">Time</th>
                            <th className="pb-2">Warning</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDetails.warnings.map((w, i) => (
                            <tr key={i} className="border-b border-red-100 last:border-0">
                              <td className="py-2 text-gray-600">{w.timestamp}</td>
                              <td className="py-2 font-semibold text-red-600">{w.warning_type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No warnings recorded.</p>
                  )}
                </div>

                {/* General Logs */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm flex-grow">
                  <h4 className="text-lg font-Orbitron font-semibold text-gray-700 mb-3">General Logs</h4>
                  {selectedDetails.logs.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto pr-2">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-700">
                            <th className="pb-2">Time</th>
                            <th className="pb-2">Orientation</th>
                            <th className="pb-2">Sentiment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDetails.logs.map((log, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0">
                              <td className="py-2 text-gray-500">{log.timestamp}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${log.head_orientation === 'Facing Camera' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {log.head_orientation}
                                </span>
                              </td>
                              <td className="py-2 capitalize">{log.sentiment}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No proctoring logs available.</p>
                  )}
                </div>

              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
