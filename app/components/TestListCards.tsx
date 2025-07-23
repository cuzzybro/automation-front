"use client"
import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

interface TestResponse {
    tests: string[];
}

export default function TestList() {
//   const router = useRouter();
  const [tests, setTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
            fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await fetch("/api/tests");
            if (!response.ok) throw new Error("Failed to fetch tests");
            const data: TestResponse = await response.json();
            if (!Array.isArray(data.tests)) {
                throw new Error()
            }
            setTests(data.tests);
        } catch (error) {
            console.error("Error fetching tests:", error);
            setError("Failed to fetch tests");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTest = (testName: string) => {
        // Navigate to test details or trigger test run
        return fetch('/api/run-tests', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testFiles: [testName] }),
            });
    };

    if (loading) {
        return <div>Loading tests...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
    }

    if (!Array.isArray(tests)) {
        console.error("Tests is not an array:", tests);
        return <div className="container mx-auto p-4 text-red-500">Error: Invalid test data</div>;
    }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.length === 0 ? (
          <p>No tests available.</p>
        ) : (
          tests.map((test, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow bg-white"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {test.replace(".jmx", "")}
              </h3>
              <button
                onClick={() => handleSelectTest(test)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Select Test
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}