import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Homepage() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
    } else {
      setUser(userData);

      axios
        .get('http://localhost:5000/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setQuizzes(response.data);
          toast.success('Quizzes fetched successfully!');
        })
        .catch((error) => {
          console.error('Error fetching quizzes:', error);
          setError('Error fetching quizzes');
          toast.error('Error fetching quizzes');
        });
    }
  }, [navigate]);

  const handleQuizSelect = (quizId) => {
    const token = localStorage.getItem('token');

    axios
      .get(`http://localhost:5000/api/quizzes/${quizId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSelectedQuiz(quizId);
        setQuestions(response.data);
        setAnswers({});
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        setError('Error fetching questions for the selected quiz.');
        toast.error('Error fetching questions');
      });
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const isSubmitEnabled = questions.every((q) => answers[q._id] !== undefined);

  const submitAnswers = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    if (!isSubmitEnabled) {
      setError('Please answer all the questions before submitting.');
      toast.error('Please answer all the questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      quizTitle: quizzes.find((quiz) => quiz._id === selectedQuiz)?.title,
      answers,
    };

    axios
      .post('http://localhost:5000/api/submit-answers', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        toast.success('Answers submitted successfully!');
        setIsSubmitting(false);
        navigate('/studentdashboard');
      })
      .catch((error) => {
        if (error.response) {
          console.error('Error submitting answers:', error.response.data);
          setError(error.response.data.message || 'Failed to submit answers.');
          toast.error(error.response.data.message || 'Failed to submit answers.');
        } else {
          console.error('Network error:', error.message);
          setError('Network error, please try again later.');
          toast.error('Network error, please try again later.');
        }
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="mt-8 w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Welcome, {user?.username}</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {!selectedQuiz ? (
          <div>
            <h3 className="text-xl font-extrabold mb-4 text-gray-700 text-center">Available Quizzes</h3>
            <ul className="space-y-4">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <li
                    key={quiz._id}
                    className="p-4 bg-gradient-to-br from-green-200 to-blue-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => handleQuizSelect(quiz._id)}
                  >
                    <h4 className=" text-black font-extrabold">{quiz.title}</h4>
                    <p className="text-sm text-red-400">{quiz.createdBy.fullname}</p>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No quizzes available yet.</li>
              )}
            </ul>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Questions for Quiz: {quizzes.find((quiz) => quiz._id === selectedQuiz)?.title}
            </h3>
            <ul className="space-y-4">
              {questions.map((q) => (
                <li key={q._id} className="p-4 bg-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all">
                  <p className="font-medium text-gray-800">{q.question}</p>
                  {q.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-3">
                      <input
                        type="radio"
                        name={`question-${q._id}`}
                        value={index}
                        onChange={() => handleAnswerChange(q._id, index)}
                        checked={answers[q._id] === index}
                        className="mr-2"
                      />
                      <label
                        className={`text-gray-700 ${
                          answers[q._id] === index ? 'font-semibold text-blue-600' : ''
                        }`}
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </li>
              ))}
            </ul>

            <button
              onClick={submitAnswers}
              className={`mt-6 px-6 py-3 rounded-lg transition-all duration-300 ${
                isSubmitEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              } font-semibold`}
              disabled={!isSubmitEnabled || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex justify-center items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Answers'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;











