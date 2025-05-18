import React from 'react';

function ResultFire() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-red-100">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center w-[800px] border border-gray-400">
        <input type="text" value="WARNING" className="w-full border text-center mb-12 p-4 text-2xl rounded" readOnly />
        <div className="text-8xl font-extrabold text-red-600 mb-6">FIRE</div>
        <div className="text-4xl mb-16 font-semibold">CHECK YOUR EMAIL, PLEASE!!</div>
        <div className="text-xl text-gray-600 tracking-widest uppercase">Thanks for trying!!!</div>
      </div>
    </div>
  );
}

export default ResultFire;