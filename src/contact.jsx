import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert(`Failed to send message: ${data.message}`);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('An error occurred. Please try again later.');
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-center text-orange-950 ">Contact Us</h2>
      <p className="mt-4 text-center text-lime-950 text-lg">
        Have any questions or feedback? We'd love to hear from you! Please fill out the form below to get in touch.
      </p>

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Section: GIF */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif"
            alt="Contact Animation"
            className="w-3/4 rounded-lg shadow-lg"
          />
        </div>

        {/* Right Section: Form */}
        <div className="w-full md:w-1/2 bg-white p-6 shadow-md rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-lg font-semibold text-gray-800">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-lg font-semibold text-gray-800">
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-lg font-semibold text-gray-800">
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                rows="5"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;


