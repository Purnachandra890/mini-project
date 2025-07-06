import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Robot from './Robot';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true); // Start loading

  try {
    const response = await fetch('http://localhost:3060/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert('User registered successfully!');
      // navigate('/login');
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (err) {
    console.error('Registration error:', err);
    alert('Something went wrong');
  } finally {
    setLoading(false); // Stop loading after response or error
  }
};


  return (
    <div className="flex flex-col md:flex-row bg-black text-white min-h-screen">
      {/* Signup Form Section */}
      <div className="w-full md:w-3/5 flex items-center justify-center px-6 md:px-20 py-10">
        <div className="max-w-md w-full space-y-8">
          <div>
            <p className="text-sm md:text-lg text-gray-300 font-semibold">START FOR FREE</p>
            <h2 className="text-3xl md:text-5xl font-bold mt-2">
              Create new account <span className="text-blue-500">.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-400">
              Already a member?{' '}
              <Link to="/login" className="text-blue-500 underline">
                Log in
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-zinc-900 text-white text-base p-4 rounded-2xl placeholder:text-white"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-zinc-900 text-white text-base p-4 rounded-2xl placeholder:text-white"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-zinc-900 text-white text-base p-4 rounded-2xl placeholder:text-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } text-white text-base font-semibold w-full py-4 rounded-2xl transition`}
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>

          </form>
        </div>
      </div>

      {/* Robot Section: visible in both views */}
      <div className="w-full md:w-2/5 flex items-center justify-center px-4 md:px-0 py-6 md:py-0">
        <Robot />
      </div>
    </div>
  );
};

export default Signup;
