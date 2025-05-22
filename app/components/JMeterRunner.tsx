'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";

export default function JMeterRunner() {
    const router = useRouter();
    const [ tests, setTests ] = useState<string[]>([]);
    const [ selectedTests, setSelectedTests ] = useState<string[]>([]);
    const [ output, setOutput ] = useState('');
    const [ running, setRunning ] = useState(false);
    const [ progress, setProgress ] = useState(0);
    const [ results, setResults] = useState<string[]>([]);
    const logRef = useRef<HTMLPreElement>(null);
    const [ showLoginModal, setShowLoginModal ] = useState(false);

    // check properties file
    useEffect(() => {
        const checkPropertiesFile = async () => {
            try {
                const response = await fetch("/api/check-properties", { method: "GET" });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error( data.error ?? "Failed to check properties");
                }

                if (data.isEmpty) {
                    setShowLoginModal(true);
                }

            } catch (err) {
                console.log(err);
                setShowLoginModal(false);
            }
        };
        checkPropertiesFile();
    }, []);

    // fetch tests
    useEffect(() => {
        async function fetchTests() {
            try {
                const res = await fetch('/api/tests');

                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

                const data = await res.json();
                setTests(data.tests);
            } catch (error) {
                console.error('Error fetching tests: ', error);
            }

        }
        fetchTests();
    }, []);

    // fetch results
    useEffect(() => {
        async function fetchResults() {
            const res = await fetch("/api/results");
            const data = await res.json();
            setResults(data.results);
        }
        fetchResults();
    }, []);

    // scrolling log
    useEffect(() => {
        if ( logRef.current ) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [output]);

    // process jmeter test
    async function runTest() {

        if (!selectedTests) return;

        setOutput('');
        setRunning(true);
        setProgress(0);

        try {

            const res = await fetch('/api/run-tests', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testFiles: selectedTests }),
            });

            if (!res.body) {
                setOutput('Failed to start test.');
                setRunning(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                setOutput((prev) => prev + decoder.decode(value));
                receivedLength += value.length;
                setProgress(Math.min(100, receivedLength % 100));
            }

        } catch (error) {
            setOutput(`Error: ${error}`);
        } finally {
            setRunning(false);
            setProgress(100);
        }
    }

    return (
        <div className="relative">
        {/* Modal for Login Popup */}
        <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          router.refresh();
        }}
      />

      <div className="p-4 shadow rounded-lg m-40">
        {/* Original code */}
        <div className="p-4 shadow rounded-lg m-40">
            <div className="flex justify-between items-center">
                <button className="px-4 py-2 rounded-full w-[180px] bg-blue-500 text-white font-bold uppercase my-4">
                    <Link href="/">Home</Link>
                </button>
                <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 rounded-full w-[180px] bg-green-500 text-white font-bold uppercase my-4"
                >
                    Update User
                </button>
            </div>

            <h2 className="text-lg font-bold mb-2">JMeter Test Runner</h2>
            <select
                multiple
                className="border p-2 w-full mb-4 bg-slate-700 h-40 overflow-y-auto"
                value={selectedTests}
                onChange={(e) =>
                    setSelectedTests(Array.from(e.target.selectedOptions, option => option.value))}
            >
                {/* <option value="">Select a test</option> */}
                {tests.map((test) => (
                <option key={test} value={test}>{test}</option>
                ))}
            </select>

            <button
                onClick={ runTest }
                disabled={ running }
                className={`px-4 py-2 rounded-full w-[180px] font-bold uppercase ${running ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
            >
                { running ? 'Running...' : 'Run Tests' }
            </button>

            { running && (
                <div className=" w-full bg-gray-200 rounded mt-4 ">
                    <div
                        className=" bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded "
                        style={{ width: `${progress}%` }}
                    >
                        { progress }%
                    </div>
                </div>
            )}

            { output && (
                <pre ref={logRef} className="mt-4 p-2 bg-slate-700 border h-40 overflow-y-auto">
                {output}
                </pre>
            )}

            <h3 className="text-lg font-bold mt-6">Previous Test Logs</h3>
            <ul className="mt-2 border p-2 bg-slate-700 h-40 overflow-y-auto">
            {results.length > 0 ? (
                results.map((result) => (
                <li key={result}>
                    <a href={`/results/${result}`} className="text-blue-500">{result}</a>
                </li>
                ))
            ) : (
                <li>No logs available</li>
            )}
            </ul>
        </div>
    </div>
    </div>
      );
}