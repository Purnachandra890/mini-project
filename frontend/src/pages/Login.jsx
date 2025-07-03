import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Robot from './Robot';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('Authorization', `Bearer ${data.token}`);
      navigate('/home');
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-black min-h-screen text-white font-manrope">
      {/* Login Form Section */}
      <div className="w-full md:w-2/3 flex items-center justify-center px-6 py-10 md:px-20">
        <div className="w-full max-w-md space-y-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Hello Creator Welcome Back<span className="text-blue-500">!</span>
            </h2>
            <p className="mt-4 text-base md:text-xl text-gray-400 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 text-white text-base md:text-lg p-5 rounded-2xl placeholder:text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 text-white text-base md:text-lg p-5 rounded-2xl placeholder:text-white"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white text-base md:text-xl font-semibold w-full py-4 rounded-2xl hover:bg-blue-600 transition"
            >
              Log In
            </button>
          </form>
        </div>
      </div>

      {/* Robot Section — right side on desktop, below form on mobile */}
      <div className="w-full md:w-1/3 flex items-center justify-center px-4 md:px-0 py-6 md:py-0">
        <Robot />
      </div>
    </div>
  );
};

export default Login;

