import React from 'react';

const UnderlineTransition2 = () => {
  return (
    <div className="group relative inline-block">
      <span className="text-2xl md:text-3xl text-gray-900 font-bold tracking-tight">Welcome to the Exam Portal</span>
      <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 group-hover:w-full"></span>
    </div>
  );
};

export default UnderlineTransition2;
