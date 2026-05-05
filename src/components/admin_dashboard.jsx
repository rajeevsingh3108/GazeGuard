import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex flex-col flex-grow items-center w-full py-10 px-4 md:px-12">
        
        {/* Header */}
        <div className="w-full max-w-7xl mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your tests and monitor student activity</p>
        </div>

        {/* Stats Row */}
        <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">📝</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              <p className="text-sm text-gray-500">MCQ Tests</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-xl">💻</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{codingTests.length}</p>
              <p className="text-sm text-gray-500">Coding Tests</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl">👥</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userDetails.length}</p>
              <p className="text-sm text-gray-500">Submissions</p>
            </div>
          </div>
        </div>

        {/* MCQ TESTS TABLE */}
        <div className="w-full max-w-7xl mb-8">
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">MCQ Tests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Test Code</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => (
                    <tr key={index}>
                      <td className="font-semibold text-gray-900">{test.test_code}</td>
                      <td>
                        <span className={`badge ${test.is_test_started ? 'badge-emerald' : 'badge-amber'}`}>
                          {test.is_test_started ? '● Live' : '○ Not Started'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {!test.is_test_started ? (
                            <button
                              onClick={() => handleStartTest(test.test_code)}
                              className="btn-primary !px-4 !py-2 !text-xs !rounded-lg !shadow-none"
                            >
                              Start
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEndTest(test.test_code)}
                              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-all"
                            >
                              End
                            </button>
                          )}
                          <button
                            onClick={() => handleResetTest(test.test_code)}
                            className="btn-secondary !px-4 !py-2 !text-xs !rounded-lg !shadow-none"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tests.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-12 text-gray-400">No MCQ tests created yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CODING TESTS TABLE */}
        <div className="w-full max-w-7xl mb-8">
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Coding Tests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Test Code</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codingTests.map((test, index) => (
                    <tr key={index}>
                      <td className="font-semibold text-gray-900">{test.test_code}</td>
                      <td>
                        <span className={`badge ${test.is_test_started ? 'badge-emerald' : 'badge-amber'}`}>
                          {test.is_test_started ? '● Live' : '○ Not Started'}
                        </span>
                      </td>
                      <td className="text-right">
                        {!test.is_test_started ? (
                          <button
                            onClick={() => handleStartCodingTest(test.test_code)}
                            className="btn-primary !px-4 !py-2 !text-xs !rounded-lg !shadow-none"
                          >
                            Start
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEndCodingTest(test.test_code)}
                            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-all"
                          >
                            End
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {codingTests.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-12 text-gray-400">No coding tests created yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* USER SESSIONS TABLE */}
        <div className="w-full max-w-7xl mb-8">
          <div className="card p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Student Submissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Test Code</th>
                    <th>Type</th>
                    <th>IP Address</th>
                    <th>Session</th>
                    <th>Completed</th>
                    <th className="text-right">Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails.map((user, index) => (
                    <tr key={index}>
                      <td className="font-semibold text-gray-900">{user.user_name}</td>
                      <td className="text-gray-600 font-mono text-xs">{user.test_id}</td>
                      <td>
                        <span className={`badge ${user.test_type === 'MCQ' ? 'badge-indigo' : 'badge-rose'}`}>
                          {user.test_type}
                        </span>
                      </td>
                      <td className="text-gray-500 font-mono text-xs">{user.ip_address}</td>
                      <td className="text-gray-500 text-xs">{user.session_login}</td>
                      <td className="text-gray-500 text-xs">{user.timestamp || '—'}</td>
                      <td className="text-right">
                        {user.score !== null && user.score !== undefined ? (
                          <button 
                            onClick={() => handleScoreClick(user.user_name, user.test_id)}
                            className="font-bold text-indigo-600 hover:text-indigo-900 transition-colors hover:underline underline-offset-4"
                          >
                            {user.score}/{user.total}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleScoreClick(user.user_name, user.test_id)}
                            className="font-semibold text-rose-600 hover:text-rose-800 transition-colors hover:underline underline-offset-4 text-xs bg-rose-50 px-3 py-1 rounded-full"
                          >
                            View Logs
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {userDetails.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-12 text-gray-400">No submissions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Navbar />

      {/* DETAILED LOGS MODAL */}
      {userDetailsModalVisible && selectedDetails && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Student Report</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDetails.username} — <span className="font-mono">{selectedDetails.testCode}</span>
                </p>
              </div>
              <button
                onClick={() => setUserDetailsModalVisible(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT: Stats & Chart */}
              <div className="flex flex-col gap-6">
                
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedDetails.total}</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attempted</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedDetails.attempted}</p>
                  </div>
                  <div className="stat-card text-center border-emerald-100">
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Correct</p>
                    <p className="text-3xl font-bold text-emerald-600">{selectedDetails.score}</p>
                  </div>
                  <div className="stat-card text-center border-rose-100">
                    <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">Incorrect</p>
                    <p className="text-3xl font-bold text-rose-600">{selectedDetails.incorrect}</p>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="stat-card">
                  <div className="flex justify-between text-sm font-semibold mb-3">
                    <span className="text-gray-500">Score</span>
                    <span className={`${selectedDetails.total > 0 && (selectedDetails.score / selectedDetails.total) >= 0.6 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedDetails.total > 0 ? Math.round((selectedDetails.score / selectedDetails.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${selectedDetails.total > 0 && (selectedDetails.score / selectedDetails.total) >= 0.6 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}
                      style={{ width: `${selectedDetails.total > 0 ? (selectedDetails.score / selectedDetails.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="stat-card flex flex-col items-center">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 self-start">Proctoring Analytics</h4>
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
                    <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                      <span className="text-4xl mb-2">✓</span>
                      <span className="text-sm">No Infractions Detected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Logs */}
              <div className="flex flex-col gap-6">
                
                {/* Warnings */}
                <div className="stat-card border-rose-100 flex-grow">
                  <h4 className="text-sm font-bold text-rose-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    Warnings ({selectedDetails.warnings.length})
                  </h4>
                  {selectedDetails.warnings.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedDetails.warnings.map((w, i) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-rose-50/50 rounded-lg px-3 py-2">
                            <span className="text-gray-500 text-xs font-mono">{w.timestamp}</span>
                            <span className="badge badge-rose !text-[10px]">{w.warning_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No warnings recorded.</p>
                  )}
                </div>

                {/* General Logs */}
                <div className="stat-card flex-grow">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Proctoring Logs ({selectedDetails.logs.length})
                  </h4>
                  {selectedDetails.logs.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedDetails.logs.map((log, i) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-gray-50/50 rounded-lg px-3 py-2">
                            <span className="text-gray-400 text-xs font-mono">{log.timestamp}</span>
                            <div className="flex items-center gap-2">
                              <span className={`badge !text-[10px] ${log.head_orientation === 'Facing Camera' ? 'badge-emerald' : 'badge-rose'}`}>
                                {log.head_orientation}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">{log.sentiment}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No proctoring logs available.</p>
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
