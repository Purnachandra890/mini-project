
import React from 'react';
import { Link } from 'react-router-dom';
import Robot from './Robot';

function HomePrivate() {
  return (
    <div className="flex flex-col md:flex-row h-auto md:h-screen bg-black text-white">
      
      {/* Left Side - Welcome Message */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start p-6 md:m-8 space-y-6 text-center md:text-left mt-32 md:mt-0">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight font-manrope">
          Welcome back, Creator! 👋
        </h1>
        <p className="text-lg md:text-2xl text-gray-300 font-medium">
          Ready to supercharge your creativity with our AI agents?
        </p>
        <Link
          to="/agents"
          className="inline-block bg-blue-500 text-white text-lg md:text-xl font-semibold px-6 py-3 rounded-xl hover:bg-blue-600 transition duration-300 w-fit"
        >
          Go to Agents →
        </Link>
      </div>

      {/* Right Side - Robot */}
      <div className="w-full md:w-1/2 h-72 md:h-4/5 flex items-center justify-center px-4 md:px-0 mb-6 md:mb-0 mt-28 md:mt-0">
        <div className="w-full h-full">
          <Robot />
        </div>
      </div>

    </div>
  );
}

export default HomePrivate;
