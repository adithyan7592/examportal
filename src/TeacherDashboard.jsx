import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
  const [ranking, setRanking] = useState([]);
  const [filteredRanking, setFilteredRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchRanking = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in to view the dashboard.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/ranking', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRanking(response.data || []);
        setFilteredRanking(response.data || []);
      } catch (err) {
        setError('Failed to fetch ranking data');
        console.error('Error fetching ranking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    setFilteredRanking(
      ranking.filter((student) =>
        student.studentName.toLowerCase().includes(lowerCaseQuery)
      )
    );
    setCurrentPage(1);
  }, [searchQuery, ranking]);

  const handleSort = (key) => {
    const order = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(order);

    const sortedData = [...filteredRanking].sort((a, b) => {
      const valA = key === 'rank' ? ranking.indexOf(a) : a[key];
      const valB = key === 'rank' ? ranking.indexOf(b) : b[key];

      if (order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

    setFilteredRanking(sortedData);
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredRanking.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const totalPages = Math.ceil(filteredRanking.length / rowsPerPage);

  return (
    <div className="min-h-screen  p-6">
      {loading && <p className="text-center text-xl font-semibold animate-pulse">Loading...</p>}
      {error && <p className="text-center text-red-600 font-medium">{error}</p>}

      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-extrabold text-teal-400 ">Student Rankings</h2>
        <input
          type="text"
          placeholder="Search by student name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md shadow-sm  text-blue-800 focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Ranking Table */}
      {filteredRanking.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm text-gray-700 shadow-lg rounded-lg bg-white">
            <thead className="bg-blue-200 text-blue-800 font-semibold">
              <tr>
                <th
                  className="px-4 py-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  onClick={() => handleSort('rank')}
                >
                  Rank
                </th>
                <th
                  className="px-4 py-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  onClick={() => handleSort('studentName')}
                >
                  Student
                </th>
                <th
                  className="px-4 py-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  onClick={() => handleSort('correctAnswersCount')}
                >
                  Correct Answers
                </th>
                <th className="px-4 py-2">Quizzes Taken</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((student, index) => (
                <tr
                  key={index}
                  className={`hover:bg-blue-100 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-2 font-medium text-center">
                    {ranking.indexOf(student) + 1}
                  </td>
                  <td className="px-4 py-2 font-semibold text-gray-900">
                    {student.studentName}
                  </td>
                  <td className="px-4 py-2 font-medium text-center">
                    {student.correctAnswersCount}
                  </td>
                  <td className="px-4 py-2">
                    <ul className="list-disc pl-4">
                      {student.quizzesTaken.map((quiz, idx) => (
                        <li
                          key={idx}
                          className="text-blue-600 font-bold italic"
                        >
                          {quiz.quizTitle}: {quiz.correctAnswers} correct
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">No ranking data available.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
















