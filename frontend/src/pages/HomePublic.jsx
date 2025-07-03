import React from 'react';
import Robot from './Robot';

function HomePublic() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      
      {/* Left Side - Text */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start items-center p-6 md:p-12 text-center md:text-left min-h-[50vh]">
        <div className="max-w-xl">
          <h1 className="font-extrabold text-3xl md:text-5xl leading-tight md:leading-snug">
            All Your Creative Tools,
            <br className="hidden md:block" />
            Powered by AI.
            <br className="hidden md:block" />
            <span className="block">Tailored for Creators.</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-300">
            Powerful AI agents to help content creators write, design, and grow — all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Robot */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 min-h-[40vh] -mt-6 md:mt-0">
        <div className="w-full h-full max-h-[400px] md:max-h-full flex justify-center items-center">
          <Robot />
        </div>
      </div>
      
    </div>
  );
}

export default HomePublic;
