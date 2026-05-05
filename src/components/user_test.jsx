// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from 'axios';
// import FaceOrientationChecker from './video';

// const McqTest = () => {
//   const navigate = useNavigate(); // Initialize useNavigate
  
//   const [testCode, setTestCode] = useState(''); // User-entered test code
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [isTestStarted, setIsTestStarted] = useState(false);
//   const [warningVisible, setWarningVisible] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [countdown, setCountdown] = useState(6);
//   const [remainingWarnings, setRemainingWarnings] = useState(4);
//   const countdownIntervalRef = useRef(null);
//   const isCountdownActiveRef = useRef(false);
//   const [timer, setTimer] = useState(90 * 60); // 23 minutes timer in seconds
//   const timerRef = useRef(null); // Ref for interval function
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   useEffect(() => {
//     if (isTestStarted && timer > 0) {
//       timerRef.current = setInterval(() => {
//         setTimer(prevTimer => prevTimer - 1);
//       }, 1000);
//     } else if (timer === 0) {
//       handleSubmitTest(); // Submit the test when time is up
//     }
    
//     // Cleanup interval when component unmounts
//     return () => clearInterval(timerRef.current);
//   }, [isTestStarted, timer]);

//   // Convert seconds to minutes and seconds format
//   const formatTime = () => {
//     const minutes = Math.floor(timer / 60);
//     const seconds = timer % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

  
//   const location = useLocation();
//   const username = location.state?.username;
//   useEffect(() => {
//     if (!username) {
//       navigate("/login_user"); // Redirect to login page
//     }
//   }, [username, navigate]);

  
//   useEffect(() => {

    
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         //handleSubmitTest(); // Automatically submit the test if the document is hidden
//       }
//     };
    

//     // Add event listener for visibility change
//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, []); //

//   useEffect(() => {
    
//     const handleRightClick = (event) => {
//       event.preventDefault();
//     };
//     const handleKeyDown = (event) => {
//       if (isFullscreen) {
//         const charCode = event.charCode || event.keyCode || event.which;
    
//         // Check for the Escape key (27)
//         if (charCode === 27) {
//           alert('Escape key is not allowed');
//           event.preventDefault();
//         }
    
//         if (event.ctrlKey && event.altKey) {
//           // Check if the Delete key (46) is pressed
//           if (event.key === 'Delete') {
//             // Trigger the test submission
//             handleSubmitTest();
//             event.preventDefault(); // Prevent the default action
//           } else {
//             // Optionally show a warning if only Control + Alt is pressed
//             showWarning(); // Show the warning modal
//             event.preventDefault();
//           }
//         }
//         // Detect if the Windows key (meta key) is pressed
//         if (event.metaKey) {
//           showWarning(); // Show the warning modal and decrement warnings
//           event.preventDefault();
//         }
    
//         // Prevent Ctrl + A / Command + A
//         if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'i' || event.key === 'c' || event.key === 'u' || event.key === 'T' || event.key === 'alt'  )) {
//           event.preventDefault();
//         }
    
//         // Check for Alt + Tab
//         if (event.altKey && event.key === 'Tab') {
//           alert('Switching to another application is not allowed!'); // Show alert

//         }
    
//         // Prevent Ctrl + Tab (switching tabs)
//         if (event.ctrlKey && event.key === 'Tab') {
//           event.preventDefault();
//         }
    
//         // Prevent both Control and Alt keys
//         if (event.ctrlKey || event.altKey) {
//           event.preventDefault();
//         }
//       }
//     };
    
    
//     document.addEventListener('contextmenu', handleRightClick);
//     document.addEventListener('keydown', handleKeyDown);

//     return () => {
//       document.removeEventListener('contextmenu', handleRightClick);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
    
//   }, [isFullscreen]);


//   const fetchTest = async () => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-test-data/${testCode}`);  // Fetch data from Flask backend
//       const data = response.data;

//       if (testCode == data.test_code) {
//         setQuestions(data.questions);
//         setIsTestStarted(true);
//         enterFullscreen(); // Enter fullscreen on valid code
//       }else if (!data.error) {
//         setQuestions(data.questions);
//         setIsTestStarted(true);
//         enterFullscreen();  // Enter fullscreen on valid code
//       } else {
//         alert('The test code you entered is invalid. Please try again.');
//         setQuestions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching test data:', error);
//     }
//   };

//   const enterFullscreen = () => {
//     const elem = document.documentElement;
//     if (elem.requestFullscreen) {
//       elem.requestFullscreen();
//     } else if (elem.mozRequestFullScreen) {
//       elem.mozRequestFullScreen();
//     } else if (elem.webkitRequestFullscreen) {
//       elem.webkitRequestFullscreen();
//     } else if (elem.msRequestFullscreen) {
//       elem.msRequestFullscreen();
//     }
//     setIsFullscreen(true);
//     resetCountdown();
//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//   };

//   const handleFullscreenChange = () => {
//     if (!document.fullscreenElement) {
//       showWarning();
//       setIsFullscreen(false);
//     } else {
//       resetCountdown();
//       setIsFullscreen(true);
//     }
//   };

//   const showWarning = () => {
//     if (remainingWarnings > 0) {
//       setWarningVisible(true);
//       setModalVisible(true);
//       setRemainingWarnings((prev) => {
//         const newRemaining = prev - 1;
//         // Check if remaining warnings are 0 and submit test
//         if (newRemaining <= 0) {
//           handleSubmitTest(); // Auto-submit if warnings reach 0
//         }
//         return newRemaining;
//       });
  
//       if (!isCountdownActiveRef.current) {
//         startCountdown();
//       }
//     } else {
//       handleSubmitTest(); // Auto-submit if warnings reach 0
//     }
//   };

//   const startCountdown = () => {
//     setCountdown(6);
//     isCountdownActiveRef.current = true;
//     countdownIntervalRef.current = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(countdownIntervalRef.current);
//           isCountdownActiveRef.current = false;
//           handleSubmitTest();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const resetCountdown = () => {
//     clearInterval(countdownIntervalRef.current);
//     setCountdown(10);
//     setWarningVisible(false);
//     setModalVisible(false);
//     isCountdownActiveRef.current = false;
//   };

//   const handleOptionChange = (index) => {
//     setSelectedOption(index);
//   };

//   const handleNextQuestion = () => {
//     // Store the answer using the question text
//     const currentQuestion = questions[currentQuestionIndex]?.question;
//     setAnswers((prevAnswers) => ({
//       ...prevAnswers,
//       [currentQuestion]: questions[currentQuestionIndex]?.options[selectedOption],
//     }));
    
//     setSelectedOption(null);
//     setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
//   };

//   const handlePrevQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       const previousQuestion = questions[currentQuestionIndex - 1]?.question;
//       const previousAnswer = answers[previousQuestion];
//       setSelectedOption(
//         previousAnswer
//           ? questions[currentQuestionIndex - 1]?.options.indexOf(previousAnswer)
//           : null
//       );
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const [sessionLogin, setSessionLogin] = useState('');
//     useEffect(() => {
//       setSessionLogin(new Date().toISOString());
//     }, []);
//   const [message, setMessage] = useState('');

//   // Function to handle form submission

//   const handleSubmitTest = async (e) => {
//     if (e) e.preventDefault();
//     let updatedAnswers = { ...answers };

//     // Check if there is a selected option for the current question and update the answers
//     if (selectedOption !== null) {
//       const currentQuestion = questions[currentQuestionIndex]?.question;
//       updatedAnswers[currentQuestion] = questions[currentQuestionIndex]?.options[selectedOption];
//     }
//         try {
//             const response = await fetch('http://localhost:5000/submit-test', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     username: username,
//                     test_id: testCode,
//                     answers: updatedAnswers,
//                     session_login: sessionLogin,
//                 }),
//             });

//             if (response.ok) {
//                 setMessage('Test submitted successfully.');
//             } else {
//                 const errorData = await response.json();
//                 setMessage(`Error: ${errorData.message}`);
//             }
//         } catch (error) {
//             setMessage('Failed to submit the test.');
//             console.error('Error submitting test:', error);
//         }
      
//     console.log(updatedAnswers);
//     // Add a slight delay to ensure the state is updated before submission
//     setTimeout(() => {
//       console.log('Submitted Answers:', updatedAnswers);
      
//       // Exit fullscreen and navigate away from the test page
//       exitFullscreen();
//       navigate('/user');
//     }, 0); // Delay can be 0 since setState is asynchronous
//   };


//   const exitFullscreen = () => {
//     if (document.exitFullscreen) {
//       document.exitFullscreen();
//     } else if (document.mozCancelFullScreen) {
//       document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) {
//       document.webkitExitFullscreen();
//     } else if (document.msExitFullscreen) {
//       document.msExitFullscreen();
//     }

//     document.removeEventListener('fullscreenchange', handleFullscreenChange);
//   };

//   const handleTestCodeChange = (e) => {
//     setTestCode(e.target.value);
//   };

//   const handleModalClose = () => {
//     if (remainingWarnings === 0) {
//       handleSubmitTest();
//     } else {
//       resetCountdown();
//       startCountdown();
//       enterFullscreen();
//     }
    
//   };

//   const [ip, setIp] = useState('');
//   useEffect(() => {
//     const fetchIp = async () => {
//       try {
//         const response = await fetch('https://api.ipify.org?format=json');
//         const data = await response.json();
//         setIp(data.ip);
//       } catch (error) {
//         console.error('Error fetching IP address:', error);
//       }
//     };

//     fetchIp();
//   }, []);
//   return (
//     <div className="flex user-select-none flex-col items-center justify-center  p-4">
//       <div className="w-full max-w-4xl">
//         {!isTestStarted ? (
//           <>
//             <h1 className="text-3xl font-bold text-gray-900 mb-4 ml-40 mt-24 font-Orbitron  ">Enter Test Code:</h1>
//             <input
//               type="text"
//               placeholder="Enter Test Code"
//               value={testCode}
//               onChange={handleTestCodeChange}
//               className="w-full max-w-xs p-2 border rounded mb-4 ml-40 font-Lex"
//             />
//             <button
//               onClick={fetchTest}
//               className="bg-blue-500 text-white px-4 py-2 rounded ml-4 font-Orbitron "
//             >
//               Submit Code
//             </button>
            
//           <div className=" font-Cabin bg-slate-200 hover:shadow-xl  m-8 p-4 rounded-lg text-xl">
//             <h1 className=' text-3xl mb-4 font-Orbitron' >Rules:</h1>
//             <ul className="list-disc list-inside space-y-2 font-Lex">
//             <li>Upon the end of time, the exam will be automatically submitted.
//             </li>
//             <li>Students should not switch tabs during examinations.
//             </li>
//             <li>
//             Students should not exit fullscreen mode during examination.
//             </li>
//             <li>
//             Students must make sure that they are facing the camera.
//             </li>
//             <li>
//             Repeated offenses will lead to exam termination.
//             </li>
//             </ul>
//           </div>
//           </>
//         ) : (

//           <div>
//             <div className="flex w-full mt-4space-x-4">
              
//               <div className="flex-grow absolute left-0 w-[70%] m-8   h-[70%] bg-gray-100 rounded-sm p-4  shadow-xl">
//                 <div className='flex justify-between items-center  mx-24 mt-4  '>
//                 <h2 className="text-5xl font-semibold mb-9 font-Orbitron">
//                   Question {currentQuestionIndex + 1} :
//                 </h2>
//                   <h1 className="text-2xl font-bold text-gray-900 mb-4 text-right font-Orbitron">Test Code: {testCode}</h1>
//                   </div>
//                 <p className="mb-9 text-3xl  font-lex ml-24">{questions[currentQuestionIndex]?.question}</p>
//                 <h1 className='text-2xl font-bold text-gray-900 mb-4 text-left ml-24 font-Orbitron'>Options:</h1>
//                 {questions[currentQuestionIndex]?.options.map((option, index) => (
                  
//         <div key={index} className="mb-2 text-2xl ml-24">
      
//         <label className="flex items-center font-lex  cursor-pointer">
//           <input
//             type="radio"
//             name={`question-${currentQuestionIndex}`}
//             checked={selectedOption === index}
//             onChange={() => handleOptionChange(index)}
//             className="hidden peer"
//           />
//           <span className="w-4 h-4 rounded-full border border-gray-400 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all"></span>
//           <span className="ml-3 text-gray-800 font-lex">{option}</span>
//         </label>
//       </div>
      
//                 ))}
//                 <div className="flex start mx-2 mt-20 font-Orbitron">
//                   <button
//                     onClick={handlePrevQuestion}
//                     className="bg-gray-300 text-gray-800 px-4 py-2 mx-4 ml-24 rounded"
//                     disabled={currentQuestionIndex === 0}
//                   >
//                     Previous
//                   </button>
//                   <button
//                     onClick={
//                       currentQuestionIndex === questions.length - 1
//                         ? handleSubmitTest
//                         : handleNextQuestion
//                     }
//                     className="bg-blue-500 text-white px-4 py-2 rounded"
//                   >
//                     {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
//                   </button>
//                 </div>
//               </div>
//               <div className=" absolute bottom-0 right-3 w-[25%] h-[40%] bg-gray-100 p-4 m-4 rounded-md shadow-md">
//                 <h2 className="text-xl font-semibold mb-4 font-Orbitron   ">Navigate Questions</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {questions.map((_, index) => (
//                     <button
//                     key={index}
//                     className={`px-5 py-3 border rounded ${
//                       index === currentQuestionIndex ? 'bg-blue-500 text-white' : 'bg-gray-300'
//                     }`}
//                     onClick={() => setCurrentQuestionIndex(index)}
//                     >
//                       {index + 1}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div className="bg-black absolute top-0 right-7 mt-16 w-[25%] h-[45%] rounded-md shadow-md">
//                   <FaceOrientationChecker />
//               </div>
//               <div className="absolute flex flex-row justify-start items-center bottom-8 py-10 px-24 bg-gray-100 shadow-xl rounded-md ml-4 left-3 w-[70%] m-2">
//                 <p className="text-5xl font-medium">Timer:</p>
//                 <h1 className="text-8xl mx-4">{formatTime()}</h1>
//                 <div className="text-3xl">Minutes</div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Warning Modal */}
//         {modalVisible && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//             <div className="bg-white p-8 rounded shadow-lg w-1/2">
//               <h2 className="text-2xl font-bold mb-4 font-Lex text-red-700">Warning!!!</h2>
//               <p>
//                 You've exited fullscreen mode. Please return to fullscreen to continue the test. You have{' '}
//                 {remainingWarnings} warnings left. The test will be submitted in {countdown} seconds if you don't return
//                 to fullscreen.
//               </p>
//               <div className="flex justify-end mt-4">
//                 <button onClick={handleModalClose} className="bg-blue-500 text-white px-4 py-2 rounded">
//                   Return to Fullscreen
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default McqTest;



// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from 'axios';
// import FaceOrientationChecker from './video';

// const McqTest = () => {
//   const navigate = useNavigate();

//   const [testCode, setTestCode] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [isTestStarted, setIsTestStarted] = useState(false);

//   const [modalVisible, setModalVisible] = useState(false);
//   const [countdown, setCountdown] = useState(6);
//   const [remainingWarnings, setRemainingWarnings] = useState(4);
//   const countdownIntervalRef = useRef(null);
//   const isCountdownActiveRef = useRef(false);

//   // timer (90 * 60 as in your file)
//   const [timer, setTimer] = useState(90 * 60);
//   const timerRef = useRef(null);
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   useEffect(() => {
//     if (isTestStarted && timer > 0) {
//       timerRef.current = setInterval(() => {
//         setTimer(prevTimer => prevTimer - 1);
//       }, 1000);
//     } else if (timer === 0) {
//       handleSubmitTest(); // Submit the test when time is up
//     }

//     return () => clearInterval(timerRef.current);
//   }, [isTestStarted, timer]);

//   const formatTime = () => {
//     const minutes = Math.floor(timer / 60);
//     const seconds = timer % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   // user & redirect
//   const location = useLocation();
//   const username = location.state?.username;
//   useEffect(() => {
//     if (!username) {
//       navigate("/login_user");
//     }
//   }, [username, navigate]);

//   // visibility (kept as originally)
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.hidden) {
//         // keep as original (commented out)
//         // handleSubmitTest();
//       }
//     };
//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, []);

//   // block keys & right click when fullscreen
//   useEffect(() => {
//     const handleRightClick = (e) => e.preventDefault();

//     const handleKeyDown = (event) => {
//       if (!isFullscreen) return;

//       const charCode = event.charCode || event.keyCode || event.which;

//       if (charCode === 27) {
//         alert('Escape key is not allowed');
//         event.preventDefault();
//       }

//       if (event.ctrlKey && event.altKey) {
//         if (event.key === 'Delete') {
//           handleSubmitTest();
//           event.preventDefault();
//         } else {
//           showWarning();
//           event.preventDefault();
//         }
//       }

//       if (event.metaKey) {
//         showWarning();
//         event.preventDefault();
//       }

//       if ((event.ctrlKey || event.metaKey) && (
//         event.key === 'a' || event.key === 'i' || event.key === 'c' ||
//         event.key === 'u' || event.key === 'T' || event.key === 'alt'
//       )) {
//         event.preventDefault();
//       }

//       if (event.altKey && event.key === 'Tab') {
//         alert('Switching to another application is not allowed!');
//       }

//       if (event.ctrlKey && event.key === 'Tab') {
//         event.preventDefault();
//       }

//       if (event.ctrlKey || event.altKey) {
//         event.preventDefault();
//       }
//     };

//     document.addEventListener('contextmenu', handleRightClick);
//     document.addEventListener('keydown', handleKeyDown);
//     return () => {
//       document.removeEventListener('contextmenu', handleRightClick);
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isFullscreen]);

//   // fetch test
//   const fetchTest = async () => {
//     try {
//       const response = await axios.get(`http://localhost:5000/get-test-data/${testCode}`);
//       const data = response.data;

//       if (testCode == data.test_code || !data.error) {
//         setQuestions(data.questions);
//         setIsTestStarted(true);
//         enterFullscreen();
//       } else {
//         alert('The test code you entered is invalid. Please try again.');
//         setQuestions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching test data:', error);
//     }
//   };

//   // fullscreen handlers
//   const enterFullscreen = () => {
//     const elem = document.documentElement;
//     if (elem.requestFullscreen) elem.requestFullscreen();
//     else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
//     else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
//     else if (elem.msRequestFullscreen) elem.msRequestFullscreen();

//     setIsFullscreen(true);
//     resetCountdown();
//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//   };

//   const handleFullscreenChange = () => {
//     if (!document.fullscreenElement) {
//       showWarning();
//       setIsFullscreen(false);
//     } else {
//       resetCountdown();
//       setIsFullscreen(true);
//     }
//   };

//   // warnings countdown logic (kept behavior)
//   const showWarning = () => {
//     if (remainingWarnings > 0) {
//       setModalVisible(true);
//       setRemainingWarnings(prev => {
//         const newRemaining = prev - 1;
//         if (newRemaining <= 0) {
//           // if warnings run out, auto submit
//           handleSubmitTest();
//         }
//         return newRemaining;
//       });

//       if (!isCountdownActiveRef.current) startCountdown();
//     } else {
//       handleSubmitTest();
//     }
//   };

//   const startCountdown = () => {
//     setCountdown(6);
//     isCountdownActiveRef.current = true;
//     countdownIntervalRef.current = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(countdownIntervalRef.current);
//           isCountdownActiveRef.current = false;
//           handleSubmitTest();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const resetCountdown = () => {
//     clearInterval(countdownIntervalRef.current);
//     setCountdown(10);
//     setModalVisible(false);
//     isCountdownActiveRef.current = false;
//   };

//   const handleOptionChange = (index) => {
//     setSelectedOption(index);
//   };

//   const handleNextQuestion = () => {
//     const currentQuestion = questions[currentQuestionIndex]?.question;
//     setAnswers(prevAnswers => ({
//       ...prevAnswers,
//       [currentQuestion]: questions[currentQuestionIndex]?.options[selectedOption],
//     }));

//     setSelectedOption(null);
//     setCurrentQuestionIndex(prevIndex => prevIndex + 1);
//   };

//   const handlePrevQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       const previousQuestion = questions[currentQuestionIndex - 1]?.question;
//       const previousAnswer = answers[previousQuestion];
//       setSelectedOption(
//         previousAnswer
//           ? questions[currentQuestionIndex - 1]?.options.indexOf(previousAnswer)
//           : null
//       );
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const [sessionLogin, setSessionLogin] = useState('');
//   useEffect(() => {
//     setSessionLogin(new Date().toISOString());
//   }, []);
//   const [message, setMessage] = useState('');

//   // stop all cameras on page (useful before navigate or on submit)
//   const stopAllCameras = () => {
//     try {
//       const videos = document.querySelectorAll('video');
//       videos.forEach(v => {
//         const stream = v.srcObject;
//         if (stream && stream.getTracks) {
//           stream.getTracks().forEach(track => track.stop());
//         }
//         try { v.srcObject = null; } catch (e) { /* ignore */ }
//       });
//     } catch (e) {
//       console.warn('Stop cameras error:', e);
//     }
//   };

//   // handle submit (stops camera and submits answers)
//   const handleSubmitTest = async (e) => {
//     if (e) e.preventDefault();
//     let updatedAnswers = { ...answers };

//     if (selectedOption !== null) {
//       const currentQuestion = questions[currentQuestionIndex]?.question;
//       updatedAnswers[currentQuestion] = questions[currentQuestionIndex]?.options[selectedOption];
//     }

//     try {
//       const response = await fetch('http://localhost:5000/submit-test', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: username,
//           test_id: testCode,
//           answers: updatedAnswers,
//           session_login: sessionLogin,
//         }),
//       });

//       if (response.ok) {
//         setMessage('Test submitted successfully.');
//       } else {
//         const errorData = await response.json();
//         setMessage(`Error: ${errorData.message}`);
//       }
//     } catch (error) {
//       setMessage('Failed to submit the test.');
//       console.error('Error submitting test:', error);
//     }

//     console.log(updatedAnswers);
//     // stop camera & exit fullscreen then navigate
//     stopAllCameras();
//     try {
//       if (document.exitFullscreen) await document.exitFullscreen();
//       else if (document.mozCancelFullScreen) await document.mozCancelFullScreen();
//       else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
//       else if (document.msExitFullscreen) await document.msExitFullscreen();
//     } catch (err) {
//       /* ignore */
//     }

//     navigate('/user');
//   };

//   const handleTestCodeChange = (e) => {
//     setTestCode(e.target.value);
//   };

//   const handleModalClose = () => {
//     if (remainingWarnings === 0) {
//       handleSubmitTest();
//     } else {
//       resetCountdown();
//       startCountdown();
//       enterFullscreen();
//     }
//   };

//   // fetch public ip (kept)
//   const [ip, setIp] = useState('');
//   useEffect(() => {
//     const fetchIp = async () => {
//       try {
//         const response = await fetch('https://api.ipify.org?format=json');
//         const data = await response.json();
//         setIp(data.ip);
//       } catch (error) {
//         console.error('Error fetching IP address:', error);
//       }
//     };

//     fetchIp();
//   }, []);

//   /* ===========================
//      RENDER
//      =========================== */
//   return (
//   <div className="min-h-screen bg-slate-50 flex items-center justify-center py-10 user-select-none">
//     <div className="w-full max-w-7xl mx-auto">

//       {/* ================= Not started : Enter Code ================= */}
//       {!isTestStarted ? (
//         <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200 mx-auto max-w-3xl">
//           <h1 className="text-4xl font-Orbitron font-bold text-slate-800 mb-6 text-center">
//             Enter Test Code
//           </h1>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <input
//               value={testCode}
//               onChange={handleTestCodeChange}
//               placeholder="Enter Test Code"
//               className="w-full sm:w-80 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
//             />
//             <button
//               onClick={fetchTest}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
//             >
//               Submit
//             </button>
//           </div>

//           <div className="mt-8 p-6 bg-slate-100 rounded-xl border border-dashed max-w-2xl mx-auto">
//             <h2 className="text-xl font-Orbitron mb-3 text-center">Rules</h2>
//             <ul className="list-disc list-inside text-slate-700 text-sm space-y-2">
//               <li>The exam will auto-submit when time ends.</li>
//               <li>Do not switch tabs during examination.</li>
//               <li>Do not exit fullscreen mode.</li>
//               <li>Face the camera at all times.</li>
//               <li>Repeated violations result in termination.</li>
//             </ul>
//           </div>
//         </div>
//       ) : (

//         /* ================= Test In Progress ================= */
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

//           {/* LEFT — Questions Section */}
//           <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border min-h-[620px]">

//             {/* Header */}
//             <div className="flex items-start justify-between mb-6">
//               <div>
//                 <h2 className="text-3xl font-Orbitron font-semibold">
//                   Question {currentQuestionIndex + 1}
//                 </h2>
//                 <p className="text-slate-600 text-sm mt-1">
//                   Test Code:
//                   <span className="font-bold text-slate-900 ml-1">{testCode}</span>
//                 </p>
//               </div>

//               <div className="text-right">
//                 <div className="text-xs text-slate-500">Time Remaining</div>
//                 <div className="text-3xl font-Orbitron font-bold">{formatTime()}</div>
//               </div>
//             </div>

//             {/* Question Text */}
//             <p className="text-2xl text-slate-800 font-Lex leading-relaxed">
//               {questions[currentQuestionIndex]?.question}
//             </p>

//             {/* Options */}
//             <div className="mt-8 space-y-4">
//               {questions[currentQuestionIndex]?.options.map((option, index) => (
//                 <label
//                   key={index}
//                   className={`flex items-center p-4 border rounded-lg cursor-pointer transition text-lg
//                   ${selectedOption === index
//                     ? "bg-blue-50 border-blue-500 shadow-inner"
//                     : "bg-white border-gray-200 hover:bg-gray-50"
//                   }`}
//                 >
//                   <input
//                     type="radio"
//                     checked={selectedOption === index}
//                     onChange={() => handleOptionChange(index)}
//                     className="hidden"
//                   />
//                   <span
//                     className={`w-5 h-5 mr-4 rounded-full inline-block flex-shrink-0
//                     ${selectedOption === index
//                       ? "bg-blue-500 border-blue-500"
//                       : "border border-gray-400 bg-white"
//                     }`}
//                   ></span>
//                   {option}
//                 </label>
//               ))}
//             </div>

//             {/* Buttons */}
//             <div className="flex items-center justify-between mt-10">
//               <button
//                 onClick={handlePrevQuestion}
//                 disabled={currentQuestionIndex === 0}
//                 className="px-5 py-3 border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
//               >
//                 Previous
//               </button>

//               <button
//                 onClick={
//                   currentQuestionIndex === questions.length - 1
//                     ? handleSubmitTest
//                     : handleNextQuestion
//                 }
//                 className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
//               >
//                 {currentQuestionIndex === questions.length - 1 ? "Submit Test" : "Next"}
//               </button>
//             </div>
//           </div>

//           {/* RIGHT — Camera + Navigation */}
//           <div className="flex flex-col gap-6">

//             {/* CAMERA BOX — LARGE & VISIBLE */}
//             <div className="bg-black rounded-2xl shadow-xl border border-gray-700 p-3">
//               <div className="w-full h-[340px] overflow-hidden rounded-lg relative">
//                 <FaceOrientationChecker />
//               </div>
//             </div>

//             {/* Question Navigator */}
//             <div className="bg-white p-5 rounded-xl shadow border">
//               <h3 className="font-Orbitron text-lg mb-3">Navigate Questions</h3>
//               <div className="flex flex-wrap gap-2">
//                 {questions.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentQuestionIndex(index)}
//                     className={`px-4 py-2 rounded-md text-sm
//                       ${
//                         index === currentQuestionIndex
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-200 hover:bg-gray-300"
//                       }`}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Warnings */}
//             <div className="bg-white p-4 rounded-xl shadow border text-center">
//               <p className="text-xs text-slate-500">Warnings Remaining</p>
//               <p className="text-3xl font-bold text-rose-600">{remainingWarnings}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Warning Modal */}
//       {modalVisible && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
//           <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xl">
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
//                 !
//               </div>

//               <div className="flex-1">
//                 <h2 className="text-2xl font-semibold text-rose-700">Warning!</h2>

//                 <p className="mt-2 text-slate-700">
//                   You exited fullscreen mode. Please return to continue your test.
//                 </p>

//                 <p className="mt-3 text-sm text-slate-500">
//                   You have{" "}
//                   <span className="font-semibold text-rose-600">{remainingWarnings}</span> warnings left.
//                   Test auto-submits in{" "}
//                   <span className="font-bold">{countdown}</span> seconds.
//                 </p>

//                 <div className="flex justify-end mt-6">
//                   <button
//                     onClick={handleModalClose}
//                     className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                   >
//                     Return to Fullscreen
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   </div>
// );

// };

// export default McqTest;



import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import FaceOrientationChecker from './video';

const McqTest = () => {
  const navigate = useNavigate();

  const [testCode, setTestCode] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isTestStarted, setIsTestStarted] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(6);
  const [remainingWarnings, setRemainingWarnings] = useState(4);
  const countdownIntervalRef = useRef(null);
  const isCountdownActiveRef = useRef(false);

  const [timer, setTimer] = useState(90 * 60);
  const timerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {


    console.log(questions);


    if (isTestStarted && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      handleSubmitTest();
    }
    return () => clearInterval(timerRef.current);
  }, [isTestStarted, timer]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const location = useLocation();
  const username = location.state?.username;

  useEffect(() => {
    if (!username) navigate("/login_user");
  }, [username, navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {};
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleRightClick = (e) => e.preventDefault();

    const handleKeyDown = (event) => {
      if (!isFullscreen) return;

      const c = event.keyCode;

      if (c === 27) {
        alert("Escape key is not allowed");
        event.preventDefault();
      }

      if (event.ctrlKey && event.altKey) {
        if (event.key === "Delete") handleSubmitTest();
        else showWarning();
        event.preventDefault();
      }

      if (event.metaKey) {
        showWarning();
        event.preventDefault();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        ["a", "i", "c", "u", "T"].includes(event.key)
      ) {
        event.preventDefault();
      }

      if (event.altKey && event.key === "Tab") alert("Switching apps not allowed!");
      if (event.ctrlKey && event.key === "Tab") event.preventDefault();
      if (event.ctrlKey || event.altKey) event.preventDefault();
    };

    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/get-test-data/${testCode}`);
      const data = response.data;

      if (testCode === data.test_code || !data.error) {
        setQuestions(data.questions);
        console.log("here are the questions ---- > ", data.questions);
        if (data.timer) {
          setTimer(data.timer * 60);
        }
        setIsTestStarted(true);
        enterFullscreen();
      } else {
        alert("Invalid test code or test not started by admin.");
        setQuestions([]);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        alert("Test not found or not started by the admin. Please check the test code or ask the admin to start the test.");
      } else {
        alert("Error fetching test data. Please ensure the backend is running and the code is correct.");
      }
      console.error(e);
    }
  };

  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

    setIsFullscreen(true);
    resetCountdown();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      showWarning();
      setIsFullscreen(false);
    } else {
      resetCountdown();
      setIsFullscreen(true);
    }
  };

  const showWarning = () => {
    if (remainingWarnings > 0) {
      setModalVisible(true);
      setRemainingWarnings(prev => {
        const newLeft = prev - 1;
        if (newLeft <= 0) handleSubmitTest();
        return newLeft;
      });

      if (!isCountdownActiveRef.current) startCountdown();
    } else {
      handleSubmitTest();
    }
  };

  const startCountdown = () => {
    setCountdown(6);
    isCountdownActiveRef.current = true;
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCountdown = () => {
    clearInterval(countdownIntervalRef.current);
    setCountdown(10);
    setModalVisible(false);
    isCountdownActiveRef.current = false;
  };

  /* ================ FIXED OPTION NAVIGATION LOGIC ================ */

  const goToQuestion = (index) => {
    const q = questions[index]?.question;
    const saved = answers[q];

    setCurrentQuestionIndex(index);

    if (saved) {
      const idx = questions[index].options.indexOf(saved);
      setSelectedOption(idx);
    } else {
      setSelectedOption(null);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      alert("Please select an option before proceeding.");
      return;
    }

    const currQ = questions[currentQuestionIndex].question;

    setAnswers(prev => ({
      ...prev,
      [currQ]: questions[currentQuestionIndex].options[selectedOption]
    }));

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) return;

    const nextQ = questions[nextIndex].question;
    const saved = answers[nextQ];

    setCurrentQuestionIndex(nextIndex);

    if (saved) {
      const idx = questions[nextIndex].options.indexOf(saved);
      setSelectedOption(idx);
    } else {
      setSelectedOption(null);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex === 0) return;

    const prevIndex = currentQuestionIndex - 1;

    const prevQ = questions[prevIndex].question;
    const saved = answers[prevQ];

    setCurrentQuestionIndex(prevIndex);

    if (saved) {
      const idx = questions[prevIndex].options.indexOf(saved);
      setSelectedOption(idx);
    } else {
      setSelectedOption(null);
    }
  };

  const stopAllCameras = () => {
    const videos = document.querySelectorAll("video");
    videos.forEach(v => {
      const stream = v.srcObject;
      if (stream) stream.getTracks().forEach(t => t.stop());
      v.srcObject = null;
    });
  };

  const [sessionLogin, setSessionLogin] = useState('');
  useEffect(() => {
    setSessionLogin(new Date().toISOString());
  }, []);

  const handleSubmitTest = async () => {
    let updated = { ...answers };

    if (selectedOption !== null) {
      const curr = questions[currentQuestionIndex].question;
      updated[curr] = questions[currentQuestionIndex].options[selectedOption];
    }

    stopAllCameras();

    try {
      const response = await fetch('http://localhost:5000/submit-test', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          test_id: testCode,
          answers: updated,
          session_login: sessionLogin
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.total > 0) {
          alert(`Test Submitted! \nReport: You scored ${result.score} out of ${result.total}.`);
        } else {
          alert("Test Submitted!");
        }
      } else {
        alert("Test Submitted, but there was an error fetching your score.");
      }
    } catch (error) {
      alert("Error: Could not reach the server to submit your test. Please ensure the backend is running.");
      console.error(error);
    }

    try { document.exitFullscreen(); } catch {}
    navigate("/user");
  };

  const handleModalClose = () => {
    if (remainingWarnings === 0) handleSubmitTest();
    else {
      resetCountdown();
      enterFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-10 user-select-none">
      <div className="w-full max-w-7xl px-4">

        {!isTestStarted ? (
          <div className="max-w-md mx-auto">
            <div className="card p-10 flex flex-col items-center text-center animate-fade-in-up">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-6">📝</div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                MCQ Examination
              </h1>
              <p className="text-sm text-gray-500 mb-8">Enter the test code provided by your administrator</p>

              <div className="w-full space-y-4">
                <input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  placeholder="Enter test code"
                  className="input-premium !text-center !text-xl !font-bold !tracking-widest !uppercase !py-4"
                />
                <button
                  onClick={fetchTest}
                  className="btn-primary w-full !py-4 !text-base !rounded-2xl"
                >
                  Start Exam →
                </button>
              </div>

              <div className="mt-8 w-full bg-gray-50 p-5 rounded-xl border border-gray-100 text-left">
                <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  Rules
                </h2>
                <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
                  <li>• Exam auto-submits when time ends</li>
                  <li>• No tab switching allowed</li>
                  <li>• Do not exit fullscreen</li>
                  <li>• Face the camera at all times</li>
                  <li>• Repeated violations will end the exam</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT PANEL — Questions */}
            <div className="lg:col-span-2 card p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-sm font-bold text-indigo-600">
                    Q{currentQuestionIndex + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Question {currentQuestionIndex + 1}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Test: <span className="font-mono font-semibold text-gray-600">{testCode}</span>
                    </p>
                  </div>
                </div>

                <div className="stat-card !p-3 !rounded-xl text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Time Left</p>
                  <p className={`text-xl font-mono font-bold ${timer < 300 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {formatTime()}
                  </p>
                </div>
              </div>

              <p className="text-lg text-gray-800 mb-8 leading-relaxed">
                {questions[currentQuestionIndex]?.question}
              </p>

              <div className="space-y-3">
                {questions[currentQuestionIndex]?.options.map((op, i) => (
                  <label
                    key={i}
                    className={`p-4 border rounded-xl flex items-center cursor-pointer transition-all duration-200
                      ${
                        selectedOption === i
                          ? "bg-indigo-50 border-indigo-500 shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={selectedOption === i}
                      onChange={() => setSelectedOption(i)}
                    />
                    <span
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${
                        selectedOption === i
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedOption === i && <div className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-gray-700">{op}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="btn-secondary !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <button
                  onClick={
                    currentQuestionIndex === questions.length - 1
                      ? handleSubmitTest
                      : handleNextQuestion
                  }
                  className={`!py-2.5 !px-8 ${
                    currentQuestionIndex === questions.length - 1
                      ? "inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
                      : "btn-primary"
                  }`}
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "Submit Test ✓"
                    : "Next →"}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex flex-col gap-4">

              {/* Camera */}
              <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900 p-2">
                <div className="w-full h-[250px] rounded-xl overflow-hidden bg-black relative">
                  <FaceOrientationChecker username={username} testCode={testCode} />
                </div>
              </div>

              {/* Question Navigator */}
              <div className="card p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Navigate</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToQuestion(i)}
                      className={`h-10 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        currentQuestionIndex === i
                          ? "bg-indigo-600 text-white shadow-sm scale-105"
                          : answers[questions[i]?.question] 
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              <div className="stat-card !border-rose-100 flex flex-col items-center justify-center text-center !py-5">
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Warnings Left</p>
                <p className={`text-3xl font-bold ${remainingWarnings <= 1 ? 'text-rose-600' : 'text-rose-500'}`}>{remainingWarnings}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center px-4 z-50">
            <div className="card max-w-md w-full p-8 animate-fade-in-up">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-rose-700">Warning</h2>

                  <p className="mt-2 text-sm text-gray-600">
                    You exited fullscreen mode. Return immediately to continue your exam.
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    Warnings left: <span className="font-bold text-rose-600">{remainingWarnings}</span>
                    <br />
                    Auto-submit in <span className="font-bold text-gray-900">{countdown}</span> seconds
                  </p>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleModalClose}
                      className="btn-primary !py-2.5"
                    >
                      Return to Fullscreen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default McqTest;
