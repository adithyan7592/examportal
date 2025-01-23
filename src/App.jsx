import './App.css';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom'; // Use Link and useNavigate here
import Student from './student';
import Home from './home';
import Register from './register';
import Login from './login';
import Homepage from './homepage';
import CreateQuestion from './createquestion';
import TeacherDashboard from './TeacherDashboard';
import Dashboard from './dashboard';
import About from './about'; 
import Contact from './contact'; 
import StudentDashboard from './studentdashboard';

function App() {
  // useNavigate hook should be inside Router component
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='student' element={<Student />} />
        <Route path='register' element={<Register />} />
        <Route path='login' element={<Login />} />
        <Route path='homepage' element={<Homepage />} />
        <Route path="/createquestion" element={<CreateQuestion />} />
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/about" element={<About />} />
         <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/contact" element={<Contact />} />
         
      </Routes>
    </Router>
  );
}

const Header = () => {
  const navigate = useNavigate(); // Correct placement of the useNavigate hook

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token from localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <header className="bg-gradient-to-br from-green-200 to-blue-200 p-4">
      
      <h1 className="text-center text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-title hover:scale-105 transition-transform duration-300 ease-in-out">
        FREE.EXAMS
      </h1>

      {/* Navigation Links with Hover Effects */}
      <nav className="flex justify-center space-x-8 mt-6">
        <Link 
          to="/" 
          className="text-lg text-gray-700 hover:text-green-700 font-extrabold transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Home
        </Link>
        <Link 
          to="/about" 
          className="text-lg text-gray-700 hover:text-green-700 font-extrabold transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          About
        </Link>
        <Link 
          to="/contact" 
          className="text-lg text-gray-700 hover:text-green-700 font-extrabold transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Contact
        </Link>
        <button 
          onClick={handleLogout} 
          className="text-red-500 text-lg  hover:bg-red-600 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default App;
