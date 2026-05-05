import React from 'react';

const UnderlineTransition3 = () => {
  return (
    <div className="group relative inline-block">
      <span className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">Dashboard</span>
      <span className="absolute left-0 bottom-0 w-0 h-[2.5px] bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 group-hover:w-full"></span>
    </div>
  );
};

export default UnderlineTransition3;
