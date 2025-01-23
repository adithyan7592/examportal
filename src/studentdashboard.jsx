import React, { useEffect, useState } from "react";

const StudentDashboard = () => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      setError(""); // Reset error state before fetching data

      try {
        const response = await fetch("http://localhost:5000/api/student-answers", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const contentType = response.headers.get("Content-Type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          if (response.ok) {
            setAnswers(data);
          } else {
            setError(data.message || "Failed to fetch answers.");
          }
        } else {
          const errorText = await response.text();
          console.error("Received non-JSON response:", errorText);
          setError("Unexpected server response. Please try again later.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Unable to fetch answers. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-lime-950">YOUR ANSWERS</h1>

      {loading && (
        <p className="text-center text-lg text-blue-600 animate-pulse">Loading your answers...</p>
      )}

      {error && (
        <div className="text-red-600 bg-red-100 p-4 rounded-md text-center mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && answers.length === 0 && (
        <p className="text-center text-gray-600 text-lg">
          No answers found. Complete a quiz to see your results here.
        </p>
      )}

      {!loading && answers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse bg-white shadow-md rounded-lg">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Question</th>
                <th className="px-4 py-2 text-left">Options</th>
                <th className="px-4 py-2 text-left">Your Answer</th>
                <th className="px-4 py-2 text-left">Correct</th>
                <th className="px-4 py-2 text-left">Quiz Title</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((answer, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <td className="px-4 py-2">{answer.questionText}</td>
                  <td className="px-4 py-2">
                    <ol className="list-decimal pl-5">
                      {answer.options.map((option, idx) => (
                        <li key={idx} className="mb-1">
                          {option}
                        </li>
                      ))}
                    </ol>
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {answer.options[answer.studentAnswer]}
                  </td>
                  <td
                    className={`px-4 py-2 font-bold ${
                      answer.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {answer.isCorrect ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2">{answer.quizTitle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;





