'use client';

import { useState } from 'react';

export default function RunJMeterButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const runJMeterTest = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/execute');
      const data = await response.json();
      if (data.success) {
        setMessage('JMeter test executed successfully!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to execute test: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button 
        onClick={runJMeterTest} 
        className="px-4 py-2 my-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 "
        disabled={loading}
      >
        {loading ? 'Running...' : 'Run JMeter Test'}
      </button>
      { message && <p className="text-gray-700"> { message } </p> }
    </div>
  );
}
