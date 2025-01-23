import { useNavigate } from 'react-router-dom';
import aboutImage from './assets/giphy.gif'; 

function About() {
  const navigate = useNavigate();

  const goToContact = () => {
    navigate('/contact'); 
  };

  return (
    <div className="flex flex-col lg:flex-row items-center p-8 min-h-screen space-y-8 lg:space-y-0">
      {/* Image */}
      <div className="flex-shrink-0 mb-4 lg:mb-0 lg:w-1/2">
        <img
          src={aboutImage}
          alt="About Us"
          className="w-full h-auto lg:h-auto object-cover lg:ml-8" 
        />
      </div>

      {/* Content */}
      <div className="flex flex-col space-y-4 bg-white p-6 rounded-lg lg:w-1/3 lg:ml-8">
        <p className="text-lg text-gray-700 font-extrabold">
          At FREE.EXAMS, our mission is to make exam preparation accessible to everyone. We provide a wide range of mock exams and quizzes to help students practice and perform well in their real exams.
        </p>
        <p className="text-lg text-gray-700 font-extrabold">
          Whether you're preparing for school exams, university entrance exams, or any other academic tests, we have the tools to help you succeed.
        </p>
        <p className="text-lg text-gray-700 font-extrabold">
          Our platform is designed to be user-friendly, interactive, and free of charge. We are here to help you learn, grow, and excel!
        </p>

        <button
          onClick={goToContact}
          className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition font-extrabold mt-4"
        >
          Contact Us
        </button>
      </div>
    </div>
  );
}

export default About;

