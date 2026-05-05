import React, { useEffect, useState } from 'react';
import Navbar from './navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Ut3 from "./underline3";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [proctoringLogs, setProctoringLogs] = useState([]);
  const [warningsLogs, setWarningsLogs] = useState([]);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [selectedTestLogs, setSelectedTestLogs] = useState('');

  useEffect(() => {
    fetchTests();
    fetchUserDetails();
  }, []);

  const fetchTests = () => {
    axios.get('http://localhost:5000/get-all-tests')
      .then(res => setTests(res.data))
      .catch(err => console.error("Error fetching tests!", err));
  };

  const fetchUserDetails = () => {
    axios.get('http://localhost:5000/get-user-sessions')
      .then(res => {
        const userData = res.data.map(u => ({
          user_name: u.username,
          ip_address: u.ip_address,
          session_login: u.session_login
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

  const handleViewLogs = (testCode) => {
    Promise.all([
      axios.get(`http://localhost:5000/get-proctoring-logs?testCode=${testCode}`),
      axios.get(`http://localhost:5000/get-warnings?testCode=${testCode}`)
    ])
      .then(([logsRes, warningsRes]) => {
        setProctoringLogs(logsRes.data);
        setWarningsLogs(warningsRes.data);
        setSelectedTestLogs(testCode);
        setLogsModalVisible(true);
      })
      .catch(err => {
        console.error("Error fetching logs or warnings", err);
        alert("Error fetching logs/warnings for test " + testCode);
      });
  };

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

                      <button
                        onClick={() => handleViewLogs(test.test_code)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 font-Orbitron"
                      >
                        View Logs
                      </button>

                    </td>
                  </tr>
                ))}
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
                  <th className="p-3 text-xl">IP Address</th>
                  <th className="p-3 text-xl">Login Time</th>
                </tr>
              </thead>

              <tbody>
                {userDetails.map((user, index) => (
                  <tr
                    key={index}
                    className="text-center font-medium text-gray-800 hover:bg-blue-50 transition"
                  >
                    <td className="p-4 border border-gray-300">{user.user_name}</td>
                    <td className="p-4 border border-gray-300">{user.ip_address}</td>
                    <td className="p-4 border border-gray-300">{user.session_login}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>

      </div>

      {/* FLOATING NAVBAR */}
      <Navbar />

      {/* LOGS MODAL */}
      {logsModalVisible && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-Orbitron font-bold text-gray-800">
                Proctoring Logs - {selectedTestLogs}
              </h3>
              <button
                onClick={() => setLogsModalVisible(false)}
                className="text-gray-500 hover:text-red-500 transition text-3xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              {proctoringLogs.length > 0 ? (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold mb-3">General Logs</h4>
                  <table className="w-full border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="p-3 text-left">Username</th>
                        <th className="p-3 text-left">Timestamp</th>
                        <th className="p-3 text-left">Head Orientation</th>
                        <th className="p-3 text-left">Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proctoringLogs.map((log, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50 transition">
                          <td className="p-3 text-gray-700">{log.username}</td>
                          <td className="p-3 text-gray-500 text-sm">{log.timestamp}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.head_orientation === 'Facing Camera' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.head_orientation}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold capitalize">
                              {log.sentiment}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 text-gray-500 text-lg">
                  No general logs available for this test.
                </div>
              )}

              {warningsLogs.length > 0 ? (
                <div>
                  <h4 className="text-xl font-semibold text-red-600 mb-3">Warnings</h4>
                  <table className="w-full border border-red-300 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-red-600 text-white">
                      <tr>
                        <th className="p-3 text-left">Username</th>
                        <th className="p-3 text-left">Timestamp</th>
                        <th className="p-3 text-left">Warning Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warningsLogs.map((log, i) => (
                        <tr key={i} className="border-b hover:bg-red-50 transition">
                          <td className="p-3 text-gray-800 font-medium">{log.username}</td>
                          <td className="p-3 text-gray-600 text-sm">{log.timestamp}</td>
                          <td className="p-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800">
                              {log.warning_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5 text-gray-500 text-lg">
                  No warnings logged for this test.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
