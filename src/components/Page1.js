import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Page1() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    navigate('/page2');
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Phát hiện cháy trên mạng biên để bảo vệ datacenter mức độ vật lý
        </h1>
        <div className="grid grid-cols-2 gap-6">
          <div className="border-4 rounded-xl flex justify-center items-center min-h-[300px]">
            <img src="/logo.png" alt="Logo" className="max-h-100 object-contain" />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <label className="flex flex-col">
              Email:
              <input
                type="email"
                name="email"
                className="border p-2 rounded"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="flex flex-col">
              Họ tên:
              <input
                type="text"
                name="name"
                className="border p-2 rounded"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-32 self-end">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page1;