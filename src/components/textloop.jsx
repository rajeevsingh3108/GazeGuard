import React from 'react';
import '../App.css'; // We'll add custom styles here

const Marquee = () => {
  return (
    <div className="absolute top-4 overflow-hidden whitespace-nowrap ">
      <div className="animate-marquee inline-block">
        <p className="text-xl font-bold text-gray-900 font-Mont">
          Kindly ensure that you have a stable internet connection.          
        </p>
      </div>
    </div>
  );
};

export default Marquee;
