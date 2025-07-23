
// components/TestSelect.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TestResponse {
  tests: string[];
}

export default function TestListSelect() {
  const router = useRouter();
  const [tests, setTests] = useState<string[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/tests");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: TestResponse = await response.json();
      console.log("API response:", data); // Log to debug
      if (!Array.isArray(data.tests)) {
        throw new Error("Expected an array for 'tests' property, got: " + typeof data.tests);
      }
      setTests(data.tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setError("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedTest) {
      router.push(`/tests/${selectedTest}`);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading tests...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Select a Test</h2>
      <div className="flex items-center gap-4">
        <select
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
          className="border rounded p-2 bg-white text-gray-800"
        >
          <option value="" disabled>
            Select a test
          </option>
          {tests.map((test, index) => (
            <option key={index} value={index}>
              {test.replace(".jmx", "")}
            </option>
          ))}
        </select>
        <button
          onClick={handleSelect}
          disabled={!selectedTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          Go
        </button>
      </div>
    </div>
  );
}
