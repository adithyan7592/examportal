import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const [user, setUser] = useState(null); // Holds the user data
  const [questions, setQuestions] = useState([]); // Holds the questions for students
  const navigate = useNavigate();

  // Fetch user and questions on page load
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    console.log('User Data:', userData); // Check if user data is present
    console.log('Token:', token); // Check if token is present

    if (!userData || !token) {
      navigate('/login'); // Redirect to login if user is not authenticated
    } else {
      setUser(userData); // Save user data locally

      // Fetch questions if the user is a student
      if (userData.role === 'student') {
        axios
          .get('http://localhost:5000/api/questions', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log('Response data:', response.data); // Log the response
            if (Array.isArray(response.data)) {
              setQuestions(response.data);
            } else {
              console.error('Invalid data format. Expected an array.');
              setQuestions([]); // Set to an empty array if data is not an array
            }
          })
          .catch((error) => {
            console.error('Error fetching questions:', error);
          });
      }
    }
  }, [navigate]);

  // Function for teacher to navigate to the create question page
  const createQuestion = () => {
    navigate('/createquestion');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="mt-8 w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome, <span className="text-green-500">{user?.username}</span>
        </h2>

        {user?.role === 'teacher' ? (
          <div className="teacher-dashboard">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Teacher Dashboard</h3>
            <button
              onClick={createQuestion}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Create Question
            </button>
          </div>
        ) : user?.role === 'student' ? (
          <div className="student-dashboard">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Student Dashboard</h3>
            <h4 className="text-lg font-medium mb-2 text-gray-600">Available Questions:</h4>
            <ul className="space-y-2">
              {questions.length > 0 ? (
                questions.map((q, index) => (
                  <li
                    key={index}
                    className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition"
                  >
                    {q.question}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No questions available yet.</li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-red-500">Error: Invalid user role!</p>
        )}
      </div>

      <footer className="mt-8 w-full text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} FREE.EXAMS. All rights reserved.
      </footer>
    </div>
  );
}

export default Homepage;


