// import React from 'react'
// import Robot from './Robot'

// function HomePublic() {
//   return (

//     <div className="flex flex-row h-screen bg-black text-white">
//       <div className="w-1/2 flex  justify-center p-6 m-8 ">
//         <p className="w-fit [font-family:'Manrope-ExtraBold',Helvetica] font-extrabold text-[64px] leading-[1.1]">
//           <span>
//             All Your Creative Tools,&nbsp;&nbsp;<br />
//             Powered by AI.&nbsp;&nbsp;<br />
//             Tailored for Creators.
//             <br />
//           </span>
//           <span className="text-4xl font-normal leading-[1.2]">
            
//             Powerful AI agents to help content 
//             creators write, design, and grow — all in one place.
//           </span>
//         </p>
//       </div>

//       {/* Right Side - Robot */}
//       <div className="w-1/2 h-4/5 ">
//         <div className="w-full h-full p-0">
//             <br />  
//           <Robot />
//         </div>
//       </div>

//     </div>
//   )
// }

// export default HomePublic




import React from 'react';
import Robot from './Robot';

function HomePublic() {
  return (
    <div className="flex flex-col md:flex-row h-auto md:h-screen bg-black text-white">
      {/* Left Side - Text */}
      <div className="w-full md:w-1/2 flex justify-center items-center text-center md:text-left p-6 md:m-8">
        <div className="w-full md:w-fit">
          <h1 className="[font-family:'Manrope-ExtraBold',Helvetica] font-extrabold text-3xl md:text-5xl leading-tight md:leading-[1.2]">
            All Your Creative Tools,&nbsp;&nbsp;
            <br className="hidden md:block" />
            Powered by AI.&nbsp;&nbsp;
            <br className="hidden md:block" />
            Tailored for Creators.
          </h1>
          <p className="mt-6 text-base md:text-xl font-normal leading-snug md:leading-relaxed text-gray-300">
            Powerful AI agents to help content creators write, design, and grow — all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Robot */}
      <div className="w-full md:w-1/2 h-72 md:h-4/5 flex items-center justify-center px-4 md:px-0 mb-6 md:mb-0">
        <div className="w-full h-full p-0">
          <Robot />
        </div>
      </div>
    </div>
  );
}

export default HomePublic;
