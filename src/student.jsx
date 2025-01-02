import { useState } from 'react';
import helloGif from './assets/hello.gif'; 
import './App.css';
import { useNavigate } from 'react-router-dom';

function Student() {
  const navigate = useNavigate()
  const register = () => {
    navigate('/register');
  }
  const login =()=>{
    navigate('/login')
  }

  return (
    <>
      <div className="flex flex-col items-center lg:flex-row  min-h-screen space-y-8 lg:space-y-0 p-8 ">
        {/* Image */}
        <div className="flex-shrink-0  lg:mb-8 mb-8 lg:w-1/2 ">
          <img src={helloGif} alt="Hello Gif" className=" w-full h-auto lg:ml-8 lg:h-auto object-cover" />
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-4 bg-white p-6 rounded-lg lg:w-1/3 ">
          <button onClick={register}  className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition">
            REGISTER
          </button>
          <button onClick={login} className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition">
            LOGIN
          </button>
        </div>
      </div>
    </>
  );
}

export default Student;
