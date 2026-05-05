import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FaceOrientationChecker from './video';

const UserCodingTest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state?.username;
    
    const [testCode, setTestCode] = useState('');
    const [testData, setTestData] = useState(null);
    const [code, setCode] = useState('# Write your code here...\n');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!username) navigate('/login_user');
    }, [username, navigate]);

    useEffect(() => {
        if (timeLeft !== null && timeLeft > 0) {
            const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0) {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleFetchTest = async () => {
        try {
            const res = await fetch(`http://localhost:5000/get-coding-test?testCode=${testCode}`);
            if (res.ok) {
                const data = await res.json();
                setTestData(data);
                setTimeLeft(data.timer * 60);
                try { document.documentElement.requestFullscreen(); } catch (e) {}
            } else {
                const errorData = await res.json();
                alert(errorData.error || errorData.message || 'Assessment not found or not started by admin.');
            }
        } catch (err) {
            alert('Error fetching test. Make sure server is running.');
        }
    };

    const handleRunCode = async () => {
        setOutput('Executing code...');
        try {
            const res = await fetch('http://localhost:5000/run-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code, stdin: testData.sample_input })
            });
            const data = await res.json();
            setOutput(data.error ? data.error : data.output);
        } catch (err) {
            setOutput('Error executing code. Check connection.');
        }
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch('http://localhost:5000/submit-coding-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test_id: testCode, username, language, code, session_login: new Date().toISOString()
                })
            });
            if (res.ok) {
                const result = await res.json();
                alert(`Assessment Submitted!\nResult: Passed ${result.score} / ${result.total} hidden test cases.`);
            } else {
                alert('Failed to submit test.');
            }
        } catch (err) {
            alert('Error submitting test. Check connection.');
        }
        
        try { document.exitFullscreen(); } catch (e) {}
        // Stop cameras before leaving
        const videos = document.querySelectorAll("video");
        videos.forEach(v => {
            if (v.srcObject) v.srcObject.getTracks().forEach(t => t.stop());
            v.srcObject = null;
        });
        navigate('/user');
    };

    if (!testData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mesh bg-dots">
                <div className="card p-10 flex flex-col gap-6 items-center max-w-sm w-full mx-4 animate-fade-in-up">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">💻</div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Coding Assessment</h2>
                    <p className="text-gray-500 text-center text-sm">Enter the assessment code provided by your administrator.</p>
                    <input 
                        className="input-premium !text-center !text-xl !font-bold !tracking-widest !uppercase !py-4" 
                        value={testCode} 
                        onChange={e => setTestCode(e.target.value.toUpperCase())} 
                        placeholder="CODE" 
                    />
                    <button 
                        onClick={handleFetchTest} 
                        className="btn-primary w-full !py-4 !text-base !rounded-2xl"
                    >
                        Enter Environment →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0f172a] text-gray-100 font-sans">
            
            {/* Header */}
            <div className="h-16 bg-[#1e293b] flex justify-between items-center px-6 shadow-sm border-b border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-500 w-3 h-3 rounded-full animate-pulse"></div>
                    <h1 className="text-xl font-semibold text-indigo-400">{testData.title}</h1>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className={`text-xl font-mono font-bold px-4 py-1.5 rounded-lg bg-slate-900 border ${timeLeft < 60 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-slate-700 text-gray-300'}`}>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                    <button onClick={handleSubmit} className="bg-emerald-600 px-6 py-2 rounded-lg font-medium hover:bg-emerald-500 shadow-sm transition-colors text-white">
                        Submit Solution
                    </button>
                </div>
            </div>

            {/* Split Pane */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Pane: Problem Description */}
                <div className="w-1/3 bg-[#1e293b] p-6 overflow-y-auto border-r border-slate-700 flex flex-col gap-6 shadow-inner">
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-white border-b border-slate-700 pb-3">Problem Statement</h2>
                        <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
                            {testData.problem_statement}
                        </p>
                    </div>
                    
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
                        <h3 className="font-semibold text-xs text-indigo-400 uppercase tracking-wider mb-3">Sample Input</h3>
                        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{testData.sample_input}</pre>
                    </div>
                    
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
                        <h3 className="font-semibold text-xs text-emerald-400 uppercase tracking-wider mb-3">Sample Output</h3>
                        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{testData.sample_output}</pre>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-700">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Live Proctoring Active</p>
                        <FaceOrientationChecker username={username} testCode={testCode} />
                    </div>
                </div>

                {/* Right Pane: Code Editor */}
                <div className="w-2/3 flex flex-col bg-[#0f172a]">
                    
                    {/* Toolbar */}
                    <div className="h-14 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-400">Language:</span>
                            <select 
                                className="bg-[#0f172a] text-white border border-slate-700 px-3 py-1.5 rounded-lg outline-none font-medium text-sm focus:border-indigo-500 transition-colors" 
                                value={language} 
                                onChange={e => setLanguage(e.target.value)}
                            >
                                <option value="python">Python 3</option>
                                <option value="java">Java</option>
                                <option value="c++">C++</option>
                            </select>
                        </div>
                        
                        <button 
                            onClick={handleRunCode} 
                            className="bg-slate-700 px-5 py-2 rounded-lg font-medium text-sm hover:bg-slate-600 transition flex items-center gap-2 text-white border border-slate-600 shadow-sm"
                        >
                            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                            Run Code
                        </button>
                    </div>

                    {/* Editor Area */}
                    <textarea 
                        className="flex-1 bg-[#1e293b]/30 text-emerald-400 font-mono text-sm p-6 outline-none resize-none leading-relaxed"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        onCopy={e => {
                            e.preventDefault();
                            alert("Copying is disabled during the assessment.");
                        }}
                        onPaste={e => {
                            e.preventDefault();
                            alert("Pasting is disabled during the assessment.");
                        }}
                        onCut={e => e.preventDefault()}
                        spellCheck="false"
                        placeholder="Write your code here... (Copy/Paste disabled)"
                    />

                    {/* Output Console */}
                    <div className="h-56 bg-[#0f172a] border-t border-slate-700 flex flex-col">
                        <div className="bg-[#1e293b] px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-slate-800">
                            Console Output
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-gray-300 whitespace-pre-wrap">
                            {output || <span className="text-gray-600 italic">Code output will appear here after running against the sample input...</span>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default UserCodingTest;
