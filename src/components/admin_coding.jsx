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
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <h2 className="text-3xl font-Orbitron font-bold mb-6 text-gray-800">Create Coding Assessment</h2>
            
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mb-6 border border-gray-200 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Import from LeetCode</label>
                    <input 
                        placeholder="Enter problem slug (e.g. two-sum)" 
                        className="border p-3 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none w-full" 
                        value={leetcodeSlug} 
                        onChange={e => setLeetcodeSlug(e.target.value)} 
                    />
                </div>
                <button 
                    type="button"
                    onClick={fetchLeetcode}
                    disabled={isLoadingLeetcode}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 h-12"
                >
                    {isLoadingLeetcode ? "Fetching..." : "Fetch Problem"}
                </button>
            </div>

            <form className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl flex flex-col gap-5 border border-gray-200" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Assessment Code (Auto-generated)</label>
                        <input required className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none w-full bg-gray-50 font-mono font-bold" value={testCode} onChange={e => setTestCode(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Problem Title</label>
                        <input placeholder="Title (e.g. Two Sum)" required className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none w-full" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Detailed Problem Statement</label>
                    <textarea placeholder="Write the problem statement here..." required className="border p-4 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none h-40 w-full" value={problemStatement} onChange={e => setProblemStatement(e.target.value)} />
                </div>
                
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sample Input</label>
                        <textarea placeholder="Sample Input" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none font-mono text-sm h-24" value={sampleInput} onChange={e => setSampleInput(e.target.value)} />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Sample Output</label>
                        <textarea placeholder="Sample Output" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none font-mono text-sm h-24" value={sampleOutput} onChange={e => setSampleOutput(e.target.value)} />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Time Limit (minutes)</label>
                    <input type="number" placeholder="Timer limit" required className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none w-1/3" value={timer} onChange={e => setTimer(e.target.value)} />
                </div>
                
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-Orbitron font-bold text-gray-800 mb-4">Hidden Evaluation Test Cases</h3>
                    <p className="text-sm text-gray-500 mb-4">These test cases will be used to automatically grade the student's submission.</p>
                    {testCases.map((tc, idx) => (
                        <div key={idx} className="flex gap-4 mb-4">
                            <textarea placeholder={`Test Case ${idx+1} Input`} className="border p-3 rounded-lg w-1/2 font-mono text-sm bg-gray-50 h-20" value={tc.input} onChange={e => handleTestCaseChange(idx, 'input', e.target.value)} />
                            <textarea placeholder={`Test Case ${idx+1} Output`} required className="border p-3 rounded-lg w-1/2 font-mono text-sm bg-gray-50 h-20" value={tc.output} onChange={e => handleTestCaseChange(idx, 'output', e.target.value)} />
                        </div>
                    ))}
                    <button type="button" onClick={handleAddTestCase} className="text-blue-600 font-bold hover:underline self-start px-2 py-1">+ Add Test Case</button>
                </div>

                <button type="submit" className="bg-blue-600 text-white p-4 rounded-xl font-Orbitron font-bold text-lg mt-4 hover:bg-blue-700 transition shadow-lg w-full">Publish Coding Test</button>
            </form>
            <Navbar />
        </div>
    );
};
export default AdminCoding;
