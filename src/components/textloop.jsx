import React from 'react';

const Marquee = () => {
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden bg-indigo-600 py-2">
      <div className="animate-marquee inline-block whitespace-nowrap">
        <p className="text-sm font-medium text-white/90 tracking-wide">
          ⚡ Kindly ensure that you have a stable internet connection before starting your exam &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🔒 All activity is monitored during the examination &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          📸 Keep your face visible to the camera at all times
        </p>
      </div>
    </div>
  );
};

export default Marquee;
