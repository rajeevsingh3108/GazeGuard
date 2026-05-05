import React from 'react';

const UnderlineTransition = () => {
  return (
    <div className="group relative inline-block">
      <span className="text-base text-gray-500 font-medium tracking-wide">Proctored Exam Tool by GazeGuard Team</span>
      <span className="absolute left-0 bottom-0 w-0 h-[1.5px] bg-indigo-500 transition-all duration-500 group-hover:w-full"></span>
    </div>
  );
};

export default UnderlineTransition;
