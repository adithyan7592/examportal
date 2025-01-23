import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch quizzes.');
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleViewQuestions = async (quizId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/quizzes/${quizId}/questions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update quizzes state to include questions for the selected quiz
      const updatedQuizzes = quizzes.map((quiz) => {
        if (quiz._id === quizId) {
          quiz.questions = response.data;
        }
        return quiz;
      });
      setQuizzes(updatedQuizzes);
      setSelectedQuizId(quizId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions.');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove deleted quiz from the state
        setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
        alert('Quiz deleted successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete quiz.');
      }
    }
  };

  const handleEditQuiz = (quizId, title) => {
    setIsEditing(true);
    setEditTitle(title);
    setSelectedQuizId(quizId);
  };

  const handleUpdateQuiz = async () => {
    if (!editTitle.trim()) {
      setError('Quiz title cannot be empty.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/quizzes/${selectedQuizId}`,
        { title: editTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the quizzes list with the new title
      const updatedQuizzes = quizzes.map((quiz) => {
        if (quiz._id === selectedQuizId) {
          quiz.title = response.data.title;
        }
        return quiz;
      });
      setQuizzes(updatedQuizzes);
      setIsEditing(false);
      setSelectedQuizId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-4">Dashboard</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-blue-600" />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Created Quizzes</h2>
            {quizzes.length === 0 ? (
              <p>No quizzes available.</p>
            ) : (
              <ul className="list-none">
                {quizzes.map((quiz) => (
                  <li key={quiz._id} className="mb-4">
                    <div className="flex justify-between items-center">
                      {isEditing && selectedQuizId === quiz._id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      ) : (
                        <span className="font-semibold text-lg">{quiz.title}</span>
                      )}

                      <div className="flex space-x-2">
                        {isEditing && selectedQuizId === quiz._id ? (
                          <>
                            <button
                              onClick={handleUpdateQuiz}
                              className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleViewQuestions(quiz._id)}
                              className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
                            >
                              View Questions
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz._id)}
                              className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleEditQuiz(quiz._id, quiz.title)}
                              className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {quiz._id === selectedQuizId && quiz.questions && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-lg">Questions:</h3>
                        <ul className="list-disc pl-6">
                          {quiz.questions.length === 0 ? (
                            <li>No questions for this quiz yet.</li>
                          ) : (
                            quiz.questions.map((question, index) => (
                              <li key={index} className="mb-2">
                                <span className="font-medium">{question.question}</span>
                                <ul className="list-none pl-4">
                                  {question.options.map((option, i) => (
                                    <li key={i} className="ml-2">{option}</li>
                                  ))}
                                </ul>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;








