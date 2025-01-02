import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import helloGif from './assets/hello.gif'; // Assuming the image is in the src/assets folder


function Home() {
  const navigate = useNavigate();

  const gotostudent = () => {
    navigate('/Student');
  };



  return (
    <div className="flex flex-col lg:flex-row items-center p-8 min-h-screen space-y-8 lg:space-y-0">
      {/* Image */}
      <div className="flex-shrink-0 mb-4 lg:mb-0 lg:w-1/2">
        <img
          src={helloGif}
          alt="Hello Gif"
          className="w-full h-auto lg:h-auto object-cover lg:ml-8" // Adjust image size and margin on large screens
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col space-y-4 bg-white p-6 rounded-lg  lg:w-1/3 lg:ml-8">
        <button
          onClick={gotostudent}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition font-extrabold "
        >
       EXAMS ARE WAITING FOR YOU
        </button>
     
      </div>
    </div>
  );
}

export default Home;


