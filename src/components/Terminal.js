import React, { useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_BASE_URL = 'http://localhost:5000/network'; // Replace with your actual API base URL
const terminalTheme = lucario;

const Terminal = () => {
    const [inputValue, setInputValue] = useState('');
    const [countResults, setCountResults] = useState([]);
    const [ckResults, setCkResults] = useState([]);
    const [checkIpResults, setCheckIpResults] = useState([]);
    const [listResults, setListResults] = useState([]);
    const [reloadResults, setReloadResults] = useState([]);
    const [error, setError] = useState(null);

    const handleCk = async () => {
        if (!inputValue.trim()) {
            setError('Please enter a link specification.');
            return;
        }
        try {
            const payload = { linkSpec: inputValue, author: '' };
            const response = await axios.post(`${API_BASE_URL}/ck`, payload);
            setCkResults(prevResults => [...prevResults, response.message]);
            setError(null);
        } catch (err) {
            setError(`Error: ${err.response ? err.response.data.error : err.message}`);
        }
    };

    const handleCheckIp = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/checkip`);
            setCheckIpResults([response.data]);
            setError(null);
        } catch (err) {
            setError(`Error: ${err.response ? err.response.data.error : err.message}`);
        }
    };

    const handleList = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/list`);
            setListResults(response.data);
            setError(null);
        } catch (err) {
            setError(`Error: ${err.response ? err.response.data.error : err.message}`);
        }
    };

    const handleReload = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/reload`);
            setListResults([response.data]);
            setError(null);
        } catch (err) {
            setError(`Error: ${err.response ? err.response.data.error : err.message}`);
        }
    };

    const handleClear = () => {
        setCountResults([]);
        setCkResults([]);
        setCheckIpResults([]);
        setListResults([]);
        setError(null);
    };

    const formatJson = (data) => JSON.stringify(data, null, 2);

    const exportResults = () => {
        const allResults = {
            countResults,
            ckResults,
            checkIpResults,
            listResults
        };
        const blob = new Blob([formatJson(allResults)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative p-4 bg-[#181A20] text-white rounded-lg shadow-lg custom-scrollbar">

            <h1 className="flex items-center text-xs font-bold text-gray-200 mb-2 uppercase">
                terminal
            </h1>
            
            <div className="bg-[#0F1015] p-4 rounded-lg mb-4 h-64 overflow-auto">
                <div>
                    {ckResults.length > 0 && (
                        <div className="mb-2">
                            {ckResults.map((result, index) => (
                                <pre key={index}>{JSON.stringify(result, null, 2)}</pre>
                            ))}
                        </div>
                    )}
                    {checkIpResults.length > 0 && (
                        <div className="overflow-x-auto">
                            {checkIpResults.map((result, index) => (
                                <div key={index} className="mb-4">
                                
                                    <div className="bg-[#0F1015] p-4 rounded-lg shadow-md">
                                        <table className="w-full text-left border-collapse">
                                            <tbody>
                                                <tr className="border-b border-gray-700">
                                                    <td className="p-2 text-gray-400">Valid Config</td>
                                                    <td className="p-2 text-gray-300">x{result.validConfig}</td>
                                                </tr>
                                                <tr className="border-b border-gray-700">
                                                    <td className="p-2 text-gray-400">Invalid Config Count</td>
                                                    <td className="p-2 text-gray-300">x{result.invalidConfig.count}</td>
                                                </tr>
                                                <tr className="border-b border-gray-700">
                                                    <td className="p-2 text-gray-400">Invalid Config Names</td>
                                                    <td className="p-2 text-gray-300">
                                                        <ul className="list-disc list-inside">
                                                            {result.invalidConfig.configNames.map((name, idx) => (
                                                                <li key={idx}>{name}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {listResults.length > 0 && (
                        <div className="overflow-x-auto">
                            <div className="mb-4">
                                <div className="bg-[#0F1015] p-4 rounded-lg shadow-md">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="p-2 text-gray-400">Index</th>
                                                <th className="p-2 text-gray-400">Config Name</th>
                                                <th className="p-2 text-gray-400">URL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listResults.map((result, index) => (
                                                <tr key={index} className={`border-b border-gray-700 ${result.validate ? 'bg-green-500' : 'bg-red-500'}`}>
                                                    <td className="p-2 text-gray-300">{index + 1}</td>
                                                    <td className="p-2 text-gray-300">{result.configName || 'N/A'}</td>
                                                    <td className="p-2 text-gray-300">{result.url || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}


                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="focus:outline-none p-2 rounded bg-[#0F1015] text-white flex-1"
                    placeholder="Enter value"
                />
                <button
                    onClick={exportResults}
                    className="px-4 py-2 bg-[#374151] text-white rounded hover:bg-[#56657c]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25" />
                    </svg>
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-[#374151] text-white rounded hover:bg-[#56657c]"
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>

                </button>
            </div>


            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-2">
                <button onClick={handleCk} className="flex items-center px-4 py-2 bg-[#374151] text-white rounded hover:bg-[#56657c] w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    change ip
                </button>
                <button onClick={handleCheckIp} className="flex items-center px-4 py-2 bg-[#374151] text-white rounded hover:bg-[#56657c] w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                    </svg>
                    check ip
                </button>
                <button onClick={handleList} className="flex items-center px-4 py-2 bg-[#374151] text-white rounded hover:bg-[#56657c] w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path fillRule="evenodd" d="M2.25 4.5A.75.75 0 0 1 3 3.75h14.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm0 4.5A.75.75 0 0 1 3 8.25h9.75a.75.75 0 0 1 0 1.5H3A.75.75 0 0 1 2.25 9Zm0 4.5a.75.75 0 0 1 .75-.75h14.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm18.75-6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75V7.5a.75.75 0 0 1 .75-.75h2.25Zm-4.5 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75V7.5a.75.75 0 0 1 .75-.75h2.25Z" clipRule="evenodd" />
                    </svg>
                    list
                </button>
                <button onClick={handleReload} className="flex items-center px-4 py-2 bg-[#374151] text-white rounded hover:bg-[#56657c] w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>

                    reload
                </button>
            </div>
        </div>
    );
};

export default Terminal;
