import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Page2() {
  const [selectedSource, setSelectedSource] = useState(null);
  const navigate = useNavigate();

  // Lấy email từ localStorage khi component mount (không hiển thị)
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      // Nếu không có email, quay lại Page1 để nhập
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = () => {
    if (!selectedSource) {
      alert('Vui lòng chọn một nguồn dữ liệu!');
      return;
    }
    // Điều hướng đến trang tương ứng với email trong localStorage
    navigate(`/${selectedSource}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-6xl h-[80vh] flex flex-col justify-between">
        <h2 className="text-3xl font-bold text-center mb-8">
          Vui lòng chọn loại dữ liệu để tiến hành phân tích cháy
        </h2>
        <div className="grid grid-cols-3 gap-12 px-12">
          {['image', 'video', 'webcam'].map((source) => (
            <div
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`option border-2 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-100 hover:shadow-lg text-2xl transition ${
                selectedSource === source ? 'border-blue-600 bg-blue-100 font-bold' : ''
              }`}
            >
              <span className="font-semibold">{source.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div className="text-right mt-8 px-12">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page2;