
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Student from './student';
import Home from './home';
import Register from './register';
import Login from './login';
import Homepage from './homepage';
import CreateQuestion from './createquestion';

function App() {
  return (
    <div>
    <Router>
    <h1 className="text-center text-4xl font-extrabold bg-green-200">FREE.EXAMS</h1>
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='student' element={<Student/>}/>
      <Route path ='register'element={<Register/>}/>
      <Route path ='login' element={<Login/>}/>
      <Route path ='homepage' element={<Homepage/>}/>
      <Route path="/createquestion" element={<CreateQuestion />} />
    </Routes>
    </Router>
     </div> 
    
  );
}

export default App;
