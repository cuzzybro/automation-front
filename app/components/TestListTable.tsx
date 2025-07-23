
// components/TestListTable.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TestResponse {
  tests: string[];
}

export default function TestListTable() {
  const router = useRouter();
  const [tests, setTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedTests = [...tests].sort((a, b) =>
    sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)
  );

  const handleSelectTest = (index: number) => {
    router.push(`/tests/${index}`);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading tests...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Test List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                className="border p-2 cursor-pointer text-left"
                onClick={handleSort}
              >
                Test Name {sortOrder === "asc" ? "↑" : "↓"}
              </th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTests.map((test, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">{test.replace(".jmx", "")}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleSelectTest(index)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
