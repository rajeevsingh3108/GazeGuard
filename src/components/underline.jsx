import React from 'react';

const UnderlineTransition = () => {
  return (
    <div className="group relative inline-block">
      <span className="text-lg text-gray-800 font-Orbitron">Proctored Exam Tool by  GazeGuard Team</span>
      <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
    </div>
  );
};

export default UnderlineTransition;
