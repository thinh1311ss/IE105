import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Hãy chọn một file ảnh!');

    // Lấy email từ localStorage
    const email = localStorage.getItem('userEmail');
    if (!email) return alert('Không tìm thấy email. Vui lòng quay lại trang đầu và nhập email!');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email); // Thêm email từ localStorage vào formData

    try {
      const res = await fetch('http://localhost:1311/api/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.result === 'fire') {
        navigate('/result');
      } else {
        navigate('/final');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Có lỗi xảy ra khi gửi ảnh!');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="bg-blue-50 flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Tải ảnh lên để phân tích cháy</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-3 rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 self-end">
            Gửi ảnh
          </button>
        </form>
        {preview && (
          <div className="mt-4 text-center">
            <img src={preview} className="mx-auto max-w-sm rounded-lg mt-4 shadow" alt="Preview" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;