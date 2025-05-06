import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Hãy chọn một file video!');

    const formData = new FormData();
    formData.append('file', file);

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
      console.error('Error uploading video:', error);
      alert('Có lỗi xảy ra khi gửi video!');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  return (
    <div className="bg-green-50 flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Tải video lên để phân tích cháy</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input type="file" accept="video/*" onChange={handleFileChange} className="border p-3 rounded" required />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 self-end">
            Gửi video
          </button>
        </form>
        {preview && (
          <div className="mt-4 text-center">
            <video controls className="mx-auto max-w-full mt-4 rounded shadow">
              <source src={preview} type={file?.type} />
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoUpload;