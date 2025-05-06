import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WebcamCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [predictionResult, setPredictionResult] = useState({ result: '', score: 0 });
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const [frameCount, setFrameCount] = useState(0);

  useEffect(() => {
    // Truy cập webcam
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((newStream) => {
        stream = newStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch((error) => {
              console.error('Error playing video:', error);
            });
          };
        }
      })
      .catch((error) => {
        alert('Không thể truy cập webcam: ' + error);
      });

    // Cleanup: Dừng stream khi component unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !userEmail || video.readyState < 1) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const processFrame = () => {
      if (!video || !canvas || video.paused || video.ended || isProcessing || video.readyState < 1) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      setIsProcessing(true);

      // Đặt kích thước canvas bằng với video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Vẽ khung hình từ video lên canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Giảm tần suất gửi yêu cầu (mỗi 5 khung hình)
      setFrameCount((prev) => prev + 1);
      if (frameCount % 5 !== 0) {
        setIsProcessing(false);
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      // Chuyển khung hình thành Blob để gửi lên backend
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'frame.png', { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', userEmail);

        try {
          const res = await fetch('http://localhost:1311/api/predict', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          console.log('Dữ liệu từ backend:', data);
          if (res.ok) {
            setPredictionResult({
              result: data.result,
              score: data.score || 0,
            });
            if (data.result === 'fire') {
              console.log(`Gửi email đến ${userEmail} vì phát hiện cháy`);
            }
          } else {
            console.error('Lỗi từ backend:', data.error);
          }
        } catch (error) {
          console.error('Error predicting frame:', error);
        } finally {
          setIsProcessing(false);
        }
      }, 'image/png');

      // Hiển thị nhãn và score trên canvas
      const { result, score } = predictionResult;
      if (result) {
        const label = result === 'fire' ? 'FIRE' : 'NO FIRE';
        const color = result === 'fire' ? 'red' : 'green';
        ctx.font = '30px Arial';
        ctx.fillStyle = color;
        ctx.fillText(`${label} (${score.toFixed(2)})`, 10, 30);
      }

      // Tiếp tục xử lý khung hình tiếp theo
      animationFrameId = requestAnimationFrame(processFrame);
    };

    // Bắt đầu xử lý khung hình khi video sẵn sàng
    if (video.readyState >= 1) {
      animationFrameId = requestAnimationFrame(processFrame);
    }

    // Cleanup: Hủy animation frame khi component unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isProcessing, predictionResult, userEmail, frameCount]);

  // Chụp khung hình và điều hướng
  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video || !userEmail || video.readyState < 1) return;

    // Đảm bảo khung hình mới được vẽ
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'snapshot.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', userEmail);

      try {
        const res = await fetch('http://localhost:1311/api/predict', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        console.log('Dữ liệu từ capture:', data);
        if (res.ok) {
          setPredictionResult({
            result: data.result,
            score: data.score || 0,
          });
          if (data.result === 'fire') {
            navigate('/result');
          } else {
            navigate('/final');
          }
        } else {
          alert('Có lỗi khi dự đoán khung hình!');
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
        alert('Có lỗi khi gửi khung hình!');
      }
    }, 'image/png');
  };

  return (
    <div className="bg-purple-50 flex justify-center items-center min-h-screen">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-center">Phân tích cháy qua webcam</h1>
        <div className="relative flex justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="rounded-lg border shadow max-w-full w-full h-auto"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        <button
          onClick={captureFrame}
          className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
        >
          Chụp khung hình
        </button>
      </div>
    </div>
  );
}

export default WebcamCapture;
