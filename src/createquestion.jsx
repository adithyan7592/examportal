import React, { useState } from 'react';
import axios from 'axios';


function CreateQuestion() {
  const [question, setQuestion] = useState([]);
  const [options, setOptions] = useState(['', '', '', '']); // Array for 4 options
  const [correctOption, setCorrectOption] = useState('');
  const [examDuration, setExamDuration] = useState(''); // Duration in minutes
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!question || options.some(opt => !opt) || correctOption === '' || !examDuration) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/questions',
        {
          question,
          options,
          correctOption,
          examDuration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(response.data.message);
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectOption('');
      setExamDuration('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Create a Question</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="question">
              Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the question"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2">Options</label>
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="w-full px-4 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ))}
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="correctOption">
              Correct Option
            </label>
            <select
              id="correctOption"
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                Select the correct option
              </option>
              {options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="examDuration">
              Exam Duration (in minutes)
            </label>
            <input
              type="number"
              id="examDuration"
              value={examDuration}
              onChange={(e) => setExamDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter duration"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Submit Question
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateQuestion;
