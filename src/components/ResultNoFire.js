import React from 'react';

function ResultNoFire() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-green-100">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center w-[800px] border border-gray-400">
        <input type="text" value="CONGRATULATION" className="w-full border text-center mb-12 p-4 text-2xl rounded" readOnly />
        <div className="text-8xl font-extrabold italic text-green-800 mb-16">NON_FIRE</div>
        <div className="text-xl text-gray-600 tracking-widest uppercase">Thanks for trying!!!</div>
      </div>
    </div>
  );
}

export default ResultNoFire;