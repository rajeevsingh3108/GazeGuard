import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';

const AdminCoding = () => {
    const [testCode, setTestCode] = useState('');
    const [title, setTitle] = useState('');
    const [problemStatement, setProblemStatement] = useState('');
    const [sampleInput, setSampleInput] = useState('');
    const [sampleOutput, setSampleOutput] = useState('');
    const [timer, setTimer] = useState(60);
    const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
    const [leetcodeSlug, setLeetcodeSlug] = useState('');
    const [isLoadingLeetcode, setIsLoadingLeetcode] = useState(false);
    
    const navigate = useNavigate();

    // Auto-generate test code on mount
    useEffect(() => {
        const randomCode = 'CODE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setTestCode(randomCode);
    }, []);

    const handleAddTestCase = () => setTestCases([...testCases, { input: '', output: '' }]);
    const handleTestCaseChange = (index, field, value) => {
        const newTC = [...testCases];
        newTC[index][field] = value;
        setTestCases(newTC);
    };

    const fetchLeetcode = async () => {
        if (!leetcodeSlug) return alert("Please enter a LeetCode problem slug (e.g. two-sum)");
        setIsLoadingLeetcode(true);
        try {
            const res = await axios.post('http://localhost:5000/fetch-leetcode', { slug: leetcodeSlug });
            setTitle(res.data.title);
            // Convert HTML to text roughly
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = res.data.content;
            setProblemStatement(tempDiv.innerText);
            setSampleInput(res.data.sample_input);
        } catch (err) {
            console.error(err);
            alert("Could not fetch from LeetCode. Check the slug or try again.");
        }
        setIsLoadingLeetcode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/create-coding-test', {
                testCode, title, problemStatement, sampleInput, sampleOutput, testCases, timer
            });
            alert('Coding test created successfully! Test Code is: ' + testCode);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Error creating coding test. Maybe test code already exists?');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center">
            
            {/* Header */}
            <div className="w-full max-w-4xl mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Coding Assessment</h1>
                <p className="text-gray-500 mt-1">Build a coding challenge with automated grading</p>
            </div>
            
            {/* LeetCode Import Card */}
            <div className="card p-6 w-full max-w-4xl mb-6 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Import from LeetCode</label>
                    <input 
                        placeholder="Enter problem slug (e.g. two-sum)" 
                        className="input-premium" 
                        value={leetcodeSlug} 
                        onChange={e => setLeetcodeSlug(e.target.value)} 
                    />
                </div>
                <button 
                    type="button"
                    onClick={fetchLeetcode}
                    disabled={isLoadingLeetcode}
                    className="btn-secondary !py-3 !px-6 !rounded-xl whitespace-nowrap disabled:opacity-50"
                >
                    {isLoadingLeetcode ? "⏳ Fetching..." : "🔗 Fetch Problem"}
                </button>
            </div>

            {/* Main Form Card */}
            <form className="card p-8 w-full max-w-4xl flex flex-col gap-6" onSubmit={handleSubmit}>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Code</label>
                        <input required className="input-premium !bg-gray-50 !font-mono !text-gray-600" value={testCode} onChange={e => setTestCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Problem Title</label>
                        <input placeholder="e.g. Two Sum" required className="input-premium" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Problem Statement</label>
                    <textarea placeholder="Describe the problem in detail..." required className="input-premium !h-40 !resize-y" value={problemStatement} onChange={e => setProblemStatement(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
                        <textarea placeholder="Sample Input" className="input-premium !h-24 !font-mono !text-sm" value={sampleInput} onChange={e => setSampleInput(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sample Output</label>
                        <textarea placeholder="Sample Output" className="input-premium !h-24 !font-mono !text-sm" value={sampleOutput} onChange={e => setSampleOutput(e.target.value)} />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                    <input type="number" placeholder="60" required className="input-premium !w-32" value={timer} onChange={e => setTimer(e.target.value)} />
                </div>
                
                {/* Test Cases Section */}
                <div className="mt-4 border-t border-gray-100 pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Hidden Test Cases</h3>
                    <p className="text-sm text-gray-500 mb-6">Used for automated grading — students won't see these.</p>
                    
                    <div className="space-y-4">
                        {testCases.map((tc, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-4">
                                <textarea 
                                    placeholder={`Test Case ${idx+1} Input`} 
                                    className="input-premium !h-24 !font-mono !text-sm !bg-gray-50"
                                    value={tc.input} 
                                    onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} 
                                />
                                <textarea 
                                    placeholder={`Test Case ${idx+1} Expected Output`} 
                                    required 
                                    className="input-premium !h-24 !font-mono !text-sm !bg-gray-50"
                                    value={tc.output} 
                                    onChange={e => handleTestCaseChange(idx, 'output', e.target.value)} 
                                />
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleAddTestCase} 
                        className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                    >
                        <span className="text-lg">+</span> Add Test Case
                    </button>
                </div>

                <button type="submit" className="btn-primary w-full !py-4 !text-base !rounded-2xl mt-4">
                    Publish Coding Test →
                </button>
            </form>
            
            <Navbar />
        </div>
    );
};
export default AdminCoding;
