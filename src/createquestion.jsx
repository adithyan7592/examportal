import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateQuestion() {
  const [quizTitle, setQuizTitle] = useState(''); // Holds the quiz title
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook to navigate

  // Handles submitting a question
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!quizTitle || !question || options.some((opt) => !opt) || correctOption === '' || correctOption < 0 || correctOption > 3 || !examDuration) {
      setError('Please fill in all fields correctly.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/questions',
        { quizTitle, question, options, correctOption, examDuration: parseInt(examDuration, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Question created successfully!');
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectOption('');
      setExamDuration('');

      // Navigate to dashboard after question is created
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center py-8">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-700 text-center mb-4">Create a Question</h1>
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Quiz Title */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Quiz Title</label>
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title (e.g., Sports)"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Question Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your question here..."
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Options</label>
            {options.map((option, index) => (
              <input
                key={index}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder={`Option ${index + 1}`}
                required
              />
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Correct Option</label>
            <select
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="" disabled>Select Correct Option</option>
              {options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Exam Duration (minutes)</label>
            <input
              type="number"
              value={examDuration}
              onChange={(e) => setExamDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter exam duration in minutes"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Question'}
          </button>
        </form>

        {/* Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate('/TeacherDashboard')}
          className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400"
        >
          Go to Rankings
        </button>
      </div>
    </div>
  );
}

export default CreateQuestion;













