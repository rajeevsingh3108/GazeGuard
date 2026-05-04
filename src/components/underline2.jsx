import React from 'react';

const UnderlineTransition2 = () => {
  return (
    <div className="group relative inline-block">
      <span className="text-3xl text-gray-800 font-semibold font-Orbitron">Welcome to the Exam Portal </span>
      <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full"></span>
    </div>
  );
};

export default UnderlineTransition2;
