from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import tensorflow as tf
import os
from dotenv import load_dotenv
from datetime import datetime
from email.mime.image import MIMEImage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import logging
from gmail_service import get_gmail_service

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load biến môi trường
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Cấu hình từ file .env
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
PORT = int(os.getenv('PORT', 1311))
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')

# Kiểm tra biến môi trường
if not EMAIL_ADDRESS:
    logger.error("EMAIL_ADDRESS không được cấu hình trong .env")
    raise ValueError("Cần cấu hình EMAIL_ADDRESS trong .env")

# Tạo thư mục upload nếu chưa tồn tại
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load TFLite model
try:
    interpreter = tf.lite.Interpreter(model_path=r"C:\UIT\IE\IE105\DoAn\MODEL\fire_detection2.tflite")
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    height, width = input_details[0]['shape'][1:3]
    logger.info(f"Đã tải mô hình TFLite với kích thước đầu vào: {height}x{width}")
except Exception as e:
    logger.error(f"Lỗi khi tải mô hình TFLite: {e}")
    raise

def send_fire_alert(email, score, image_path=None):
    try:
        service = get_gmail_service()
        
        message = MIMEMultipart()
        message['To'] = email
        message['From'] = EMAIL_ADDRESS
        message['Subject'] = 'CẢNH BÁO: Phát hiện cháy!'

        text_content = f"""
        CẢNH BÁO CHÁY
        Độ tin cậy: {score*100:.2f}%
        Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """
        message.attach(MIMEText(text_content, 'plain'))

        html_content = f"""
        <h2 style="color: red;">🔥 CẢNH BÁO CHÁY 🔥</h2>
        <p>Độ tin cậy: <strong>{score*100:.2f}%</strong></p>
        <p>Thời gian: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        """
        message.attach(MIMEText(html_content, 'html'))

        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as img_file:
                img_data = img_file.read()
            mime_image = MIMEImage(img_data, name='fire_alert.jpg')
            mime_image.add_header('Content-Disposition', 'attachment', filename='fire_alert.jpg')
            message.attach(mime_image)
            logger.info(f"Đã đính kèm ảnh: {image_path}")

        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        send_message = {'raw': encoded_message}

        result = service.users().messages().send(
            userId="me",
            body=send_message
        ).execute()
        
        logger.info(f"Đã gửi email đến {email}, Message ID: {result['id']}")
        return True
    
    except Exception as e:
        logger.error(f"Lỗi khi gửi email: {e}")
        return False

def predict_fire(image):
    try:
        logger.debug(f"Hình ảnh gốc: {image.shape}")
        if image.size == 0:
            logger.warning("Ảnh đầu vào rỗng, trả về kết quả mặc định")
            return False, 0.0
        
        # Resize ảnh theo kích thước yêu cầu của mô hình
        image = cv2.resize(image, (width, height))
        
        # Chuẩn hóa về [0, 1] như trong huấn luyện
        image_float = image.astype(np.float32) / 255.0
        
        image = np.expand_dims(image_float, axis=0)
        logger.debug(f"Hình ảnh sau xử lý: {image.shape}")
        
        # Đưa ảnh vào mô hình
        interpreter.set_tensor(input_details[0]['index'], image)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])
        raw_score = float(output[0][0])
        
        # Debug giá trị đầu ra thô
        logger.info(f"Điểm dự đoán thô (raw_score): {raw_score}")
        
        # Áp dụng sigmoid nếu đầu ra không chuẩn hóa
        if raw_score < 0 or raw_score > 1:
            score = 1 / (1 + np.exp(-raw_score))
            logger.info(f"Score sau sigmoid: {score}")
        else:
            score = raw_score
        
        # Điều chỉnh ngưỡng phân loại (thử nghiệm với ngưỡng thấp hơn)
        threshold = 0.5  # Giảm ngưỡng xuống 0.1
        is_fire = score > threshold
        logger.info(f"Ngưỡng phân loại: {threshold}, Kết quả: {'fire' if is_fire else 'no_fire'}, Score: {score}")
        
        return is_fire, score
    except Exception as e:
        logger.error(f"Lỗi trong predict_fire: {e}")
        return False, 0.0

@app.route('/api/predict', methods=['POST'])
def predict():
    logger.info("Nhận yêu cầu tại /api/predict")
    logger.info(f"Request files: {request.files}")
    logger.info(f"Request form: {request.form}")

    if 'file' not in request.files:
        logger.error("Không có tệp trong yêu cầu")
        return jsonify({"error": "Không có tệp trong yêu cầu"}), 400

    user_email = request.form.get('email')
    if not user_email:
        logger.error("Không có email trong yêu cầu")
        return jsonify({"error": "Vui lòng nhập email"}), 400
    
    logger.info(f"Email nhận từ frontend: {user_email}")
    logger.info(f"Email gửi từ: {EMAIL_ADDRESS}")
    
    file = request.files['file']
    filename = file.filename.lower()
    ext = os.path.splitext(filename)[1]

    try:
        if ext in ['.jpg', '.jpeg', '.png']:
            npimg = np.frombuffer(file.read(), np.uint8)
            img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
            if img is None or img.size == 0:
                logger.error("Không thể giải mã ảnh")
                return jsonify({"error": "Không thể giải mã ảnh"}), 400
            
            # Debug: Lưu ảnh để kiểm tra
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = os.path.join(app.config['UPLOAD_FOLDER'], f"fire_check_{timestamp}{ext}")
            cv2.imwrite(img_path, img)
            logger.info(f"Đã lưu ảnh tại: {img_path}")
            
            # Dự đoán
            is_fire, score = predict_fire(img)
        
        else:
            logger.error("Chỉ chấp nhận ảnh (jpg, jpeg, png)")
            return jsonify({"error": "Chỉ chấp nhận ảnh"}), 400

        result = "fire" if is_fire else "no_fire"
        logger.info(f"Kết quả dự đoán: {result}, điểm: {score}")
        
        if is_fire:
            logger.info(f"Gửi email từ {EMAIL_ADDRESS} đến {user_email}")
            send_fire_alert(user_email, score, img_path)
        
        return jsonify({
            "result": result,
            "score": score,
            "message": "Cảnh báo đã được gửi qua email" if is_fire else "Không phát hiện cháy",
            "image_path": img_path if ext in ['.jpg', '.jpeg', '.png'] else None
        })
    
    except Exception as e:
        logger.error(f"Lỗi trong route /api/predict: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT, debug=os.getenv('FLASK_ENV') == 'development')