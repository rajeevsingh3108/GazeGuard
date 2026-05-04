// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const TestPage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const testCode = location.state?.testCode;

//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [currentQuestion, setCurrentQuestion] = useState('');
//   const [options, setOptions] = useState(['', '', '', '']);

//   const updateQuestion = () => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[currentQuestionIndex] = {
//       question: currentQuestion,
//       options,
//     };
//     setQuestions(updatedQuestions);
//   };

//   const handleAddOrNextQuestion = () => {
//     updateQuestion();

//     if (currentQuestionIndex === questions.length) {
//       setQuestions([...questions, { question: currentQuestion, options }]);
//     }

//     setCurrentQuestion('');
//     setOptions(['', '', '', '']);
//     setCurrentQuestionIndex(currentQuestionIndex + 1);
//   };

//   const handlePrevQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       const previousQuestion = questions[currentQuestionIndex - 1];
//       setCurrentQuestion(previousQuestion?.question || '');
//       setOptions(previousQuestion?.options || ['', '', '', '']);
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const handleOptionChange = (index, value) => {
//     const newOptions = [...options];
//     newOptions[index] = value;
//     setOptions(newOptions);
//   };

//   const handleQuestionClick = (index) => {
//     const selectedQ = questions[index];
//     setCurrentQuestion(selectedQ?.question || '');
//     setOptions(selectedQ?.options || ['', '', '', '']);
//     setCurrentQuestionIndex(index);
//   };

//   const handleSubmit = async () => {
//     updateQuestion();

//     if (currentQuestionIndex === questions.length) {
//       setQuestions([...questions, { question: currentQuestion, options }]);
//     }

//     const questionData = {
//       testCode: testCode,
//       timer: 60,
//       questions: questions
//     };

//     try {
//       const response = await fetch('http://127.0.0.1:5000/create-test', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(questionData)
//       });

//       if (response.ok) {
//         alert("Test Submitted Successfully!");
//         navigate('/dashboard', { state: { testCode } });
//       } else {
//         throw new Error('Failed to submit test');
//       }
//     } catch (error) {
//       alert('Error submitting test.');
//       console.error(error);
//     }
//   };

//   const handleRemoveQuestion = (index) => {
//     const updated = questions.filter((_, i) => i !== index);
//     setQuestions(updated);

//     if (currentQuestionIndex >= updated.length) {
//       setCurrentQuestionIndex(updated.length - 1);
//     }

//     if (currentQuestionIndex === index) {
//       const newCurrent = updated[currentQuestionIndex - 1];
//       setCurrentQuestion(newCurrent?.question || '');
//       setOptions(newCurrent?.options || ['', '', '', '']);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center">

//       {/* TITLE */}
//       <h1 className="text-4xl font-Orbitron font-bold text-slate-800 mt-4 mb-6">
//         Create Test — <span className="text-blue-600">{testCode}</span>
//       </h1>

//       {/* MAIN FLEX */}
//       <div className="flex w-full max-w-7xl gap-6">

//         {/* LEFT PANEL — QUESTION NAVIGATOR */}
//         <div className="w-1/3 bg-white shadow-lg rounded-xl p-6 border border-gray-200 h-fit">
//           <h2 className="text-2xl font-Orbitron mb-4 text-gray-800">Questions</h2>

//           <div className="flex flex-wrap gap-3 mt-4">
//             {questions.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleQuestionClick(index)}
//                 className={`
//                   w-12 h-12 rounded-lg text-lg font-bold transition
//                   ${index === currentQuestionIndex 
//                     ? 'bg-blue-600 text-white shadow-md' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
//                 `}
//               >
//                 {index + 1}
//               </button>
//             ))}

//             {/* Add New Question */}
//             <button
//               onClick={() => handleQuestionClick(questions.length)}
//               className={`
//                 w-12 h-12 rounded-lg text-lg font-bold transition
//                 ${currentQuestionIndex === questions.length 
//                   ? 'bg-blue-600 text-white shadow' 
//                   : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
//               `}
//             >
//               +
//             </button>
//           </div>
//         </div>

//         {/* RIGHT PANEL — QUESTION BUILDER */}
//         <div className="flex-1 bg-white rounded-xl shadow-lg p-6 border border-gray-200">

//           <h2 className="text-3xl font-Orbitron font-semibold mb-6 text-slate-800">
//             Question {currentQuestionIndex + 1}
//           </h2>

//           {/* QUESTION INPUT */}
//           <input
//             type="text"
//             value={currentQuestion}
//             onChange={(e) => setCurrentQuestion(e.target.value)}
//             placeholder="Enter your question here..."
//             className="w-full p-3 mb-6 text-lg rounded-lg border border-gray-300 font-Lex shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
//           />

//           {/* OPTIONS */}
//           <h3 className="text-xl font-Orbitron mb-3">Options</h3>

//           {options.map((option, index) => (
//             <input
//               key={index}
//               type="text"
//               value={option}
//               onChange={(e) => handleOptionChange(index, e.target.value)}
//               placeholder={`Option ${index + 1}`}
//               className="w-full p-3 mb-3 rounded-lg border border-gray-300 text-lg font-Lex shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
//             />
//           ))}

//           {/* BUTTONS */}
//           <div className="flex justify-between items-center mt-6">

//             {/* PREV */}
//             <button
//               onClick={handlePrevQuestion}
//               disabled={currentQuestionIndex === 0}
//               className={`px-6 py-3 rounded-lg font-Orbitron text-white 
//                 ${currentQuestionIndex === 0 
//                   ? 'bg-gray-400 cursor-not-allowed' 
//                   : 'bg-slate-700 hover:bg-slate-800'}
//               `}
//             >
//               Previous
//             </button>

//             {/* RIGHT BUTTONS */}
//             <div className="flex items-center gap-3">

//               {questions.length > 0 && (
//                 <button
//                   onClick={() => handleRemoveQuestion(currentQuestionIndex)}
//                   className="px-6 py-3 bg-red-600 text-white rounded-lg font-Orbitron hover:bg-red-700 shadow-md"
//                 >
//                   Delete
//                 </button>
//               )}

//               <button
//                 onClick={handleAddOrNextQuestion}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg font-Orbitron hover:bg-blue-700 shadow-md"
//               >
//                 {currentQuestionIndex === questions.length ? 'Add' : 'Next'}
//               </button>

//               {questions.length > 0 && (
//                 <button
//                   onClick={handleSubmit}
//                   className="px-6 py-3 bg-green-600 text-white rounded-lg font-Orbitron hover:bg-green-700 shadow-md"
//                 >
//                   Submit Test
//                 </button>
//               )}

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default TestPage;



import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const testCode = location.state?.testCode;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);

  /* -------------------------------
      SAVE CURRENT QUESTION SAFELY
  --------------------------------*/
  const saveCurrentQuestion = () => {
    if (!currentQuestion.trim()) return;

    const updated = [...questions];

    updated[currentQuestionIndex] = {
      question: currentQuestion,
      options: [...options]
    };

    setQuestions(updated);
  };

  /* -------------------------------
        ADD or GO TO NEXT QUESTION
  --------------------------------*/
  const handleAddOrNextQuestion = () => {
    saveCurrentQuestion();

    // if user is adding a new question
    if (currentQuestionIndex === questions.length - 1 || questions.length === 0) {
      setQuestions(prev => [
        ...prev,
        { question: currentQuestion, options: [...options] }
      ]);
    }

    // move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    // If next question exists, load it — otherwise blank fields
    if (questions[nextIndex]) {
      setCurrentQuestion(questions[nextIndex].question);
      setOptions(questions[nextIndex].options);
    } else {
      setCurrentQuestion("");
      setOptions(["", "", "", ""]);
    }
  };

  /* -------------------------------
                PREVIOUS
  --------------------------------*/
  const handlePrevQuestion = () => {
    if (currentQuestionIndex === 0) return;

    saveCurrentQuestion();

    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);

    setCurrentQuestion(questions[prevIndex].question);
    setOptions(questions[prevIndex].options);
  };

  /* -------------------------------
             CLICK QUESTION BUTTON
  --------------------------------*/
  const handleQuestionClick = (index) => {
    saveCurrentQuestion();

    // If clicking the “+” button
    if (index === questions.length) {
      setCurrentQuestion("");
      setOptions(["", "", "", ""]);
      setCurrentQuestionIndex(index);
      return;
    }

    // Load selected question
    const q = questions[index];
    setCurrentQuestion(q.question);
    setOptions(q.options);
    setCurrentQuestionIndex(index);
  };

  /* -------------------------------
                  DELETE
  --------------------------------*/
  const handleRemoveQuestion = () => {
    if (questions.length === 0) return;

    const updated = [...questions];
    updated.splice(currentQuestionIndex, 1);

    setQuestions(updated);

    let newIndex = currentQuestionIndex - 1;
    if (newIndex < 0) newIndex = 0;

    setCurrentQuestionIndex(newIndex);

    if (updated[newIndex]) {
      setCurrentQuestion(updated[newIndex].question);
      setOptions(updated[newIndex].options);
    } else {
      setCurrentQuestion("");
      setOptions(["", "", "", ""]);
    }
  };

  /* -------------------------------
                  SUBMIT
  --------------------------------*/
  const handleSubmit = async () => {
    saveCurrentQuestion();

    const payload = {
      testCode,
      timer: 60,
      questions
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/create-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Test Created Successfully!");
        navigate("/dashboard", { state: { testCode } });
      } else {
        alert("Error submitting test.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting test.");
    }
  };

  /* -------------------------------
                 RENDER
  --------------------------------*/
  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center">
      <h1 className="text-4xl font-Orbitron font-bold text-slate-800 mt-4 mb-6">
        Create Test — <span className="text-blue-600">{testCode}</span>
      </h1>

      <div className="flex w-full max-w-7xl gap-6">

        {/* LEFT - NAVIGATOR */}
        <div className="w-1/3 bg-white shadow-lg rounded-xl p-6 border border-gray-200 h-fit">
          <h2 className="text-2xl font-Orbitron mb-4 text-gray-800">Questions</h2>

          <div className="flex flex-wrap gap-3">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(index)}
                className={`w-12 h-12 rounded-lg text-lg font-bold 
                  ${index === currentQuestionIndex ? "bg-blue-600 text-white" : "bg-gray-200"}
                `}
              >
                {index + 1}
              </button>
            ))}

            {/* + Button */}
            <button
              onClick={() => handleQuestionClick(questions.length)}
              className={`w-12 h-12 rounded-lg text-xl font-bold 
                ${currentQuestionIndex === questions.length ? "bg-blue-600 text-white" : "bg-gray-200"}
              `}
            >
              +
            </button>
          </div>
        </div>

        {/* RIGHT - BUILDER */}
        <div className="flex-1 bg-white shadow-lg rounded-xl p-6 border">

          <h2 className="text-3xl font-Orbitron font-semibold mb-6">
            Question {currentQuestionIndex + 1}
          </h2>

          {/* QUESTION INPUT */}
          <input
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Enter question..."
            className="w-full p-3 text-lg border rounded-lg mb-6"
          />

          {/* OPTIONS */}
          <h3 className="text-xl font-Orbitron mb-3">Options</h3>

          {options.map((op, i) => (
            <input
              key={i}
              value={op}
              onChange={(e) => {
                const arr = [...options];
                arr[i] = e.target.value;
                setOptions(arr);
              }}
              placeholder={`Option ${i + 1}`}
              className="w-full p-3 text-lg border rounded-lg mb-3"
            />
          ))}

          {/* BUTTONS */}
          <div className="flex justify-between mt-6">

            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-400 rounded-lg text-white disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex gap-3">

              {questions.length > 0 && (
                <button
                  onClick={handleRemoveQuestion}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              )}

              <button
                onClick={handleAddOrNextQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                {currentQuestionIndex === questions.length ? "Add" : "Next"}
              </button>

              {questions.length > 0 && (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg"
                >
                  Submit Test
                </button>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestPage;
