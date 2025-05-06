import os
import logging
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Phạm vi cần thiết
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    """Khởi tạo và trả về dịch vụ Gmail API."""
    creds = None
    # File token.json lưu trữ access và refresh tokens
    token_path = 'token.json'
    
    try:
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            logger.info("Đã tải token từ token.json")
        
        # Kiểm tra tính hợp lệ của credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                logger.info("Token đã hết hạn, đang làm mới...")
                creds.refresh(Request())
            else:
                logger.info("Không có token hợp lệ, yêu cầu xác thực mới...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Lưu token mới
            with open(token_path, 'w') as token:
                token.write(creds.to_json())
                logger.info("Đã lưu token mới vào token.json")
        
        # Khởi tạo dịch vụ Gmail
        service = build('gmail', 'v1', credentials=creds)
        logger.info("Dịch vụ Gmail API đã được khởi tạo thành công")
        return service
    
    except Exception as e:
        logger.error(f"Lỗi khi khởi tạo dịch vụ Gmail: {e}")
        raise