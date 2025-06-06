from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json
import logging

logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Tải mô hình
try:
    model = joblib.load("../server/models/modelV3.pkl")
    logger.info("Mô hình đã được tải V3 thành công")
except Exception as e:
    logger.error(f"Lỗi khi tải mô hình: {str(e)}")
    model = None
@app.route('/')
def hello():
    return "Chào mừng đến với API dự đoán bệnh tiểu đường!"
@app.route('/predict', methods=['POST'])
def predict():
    try:
        logger.info("Nhận yêu cầu dự đoán")
        data = request.get_json()
        logger.info(f"Dữ liệu nhận được: {data}")

        # Kiểm tra dữ liệu đầu vào
        required_fields = [
            'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness',
            'insulin', 'bmi', 'diabetes_pedigree', 'age'
        ]
        
        for field in required_fields:
            if field not in data:
                logger.error(f"Thiếu trường dữ liệu: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Chuẩn bị dữ liệu đầu vào cho mô hình
        input_features = [
            float(data['pregnancies']),
            float(data['glucose']),
            float(data['blood_pressure']),
            float(data['skin_thickness']),
            float(data['insulin']),
            float(data['bmi']),
            float(data['diabetes_pedigree']),
            float(data['age'])
        ]

        input_array = np.array([input_features])
        logger.info(f"Dữ liệu đầu vào cho mô hình: {input_array}")

        # Dự đoán
        if model is None:
            logger.error("Mô hình chưa được tải")
            return jsonify({"error": "Model not loaded"}), 500
            
        probabilities = model.predict_proba(input_array)[0]  # [P(0), P(1)]
        risk_percentage = round(probabilities[1] * 100, 2)   # Xác suất bị tiểu đường (%)
        predicted_label = 1 if risk_percentage >= 50 else 0  # Chẩn đoán bị tiểu đường nếu xác suất >= 50%

        logger.info(f"Kết quả dự đoán: risk_percentage={risk_percentage}, predicted_label={predicted_label}")

        # Trả về kết quả
        return jsonify({
            "status": "success",
            "risk_percentage": risk_percentage,
            "predicted_label": predicted_label
        })
    
    except Exception as e:
        logger.error(f"Lỗi khi dự đoán: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/get-advice', methods=['POST'])
def get_advice():
    """
    Endpoint nhận % nguy cơ và trả về lời khuyên từ AI.
    """
    try:
        logger.info("Nhận yêu cầu lời khuyên")
        data = request.get_json()
        logger.info(f"Dữ liệu nhận được: {data}")
        
        # Kiểm tra dữ liệu đầu vào
        if 'risk_percentage' not in data:
            logger.error("Thiếu trường risk_percentage")
            return jsonify({"error": "Missing risk_percentage parameter"}), 400
            
        risk_percentage = data['risk_percentage']
        
        # Kiểm tra giá trị risk_percentage
        try:
            risk_percentage = float(risk_percentage)
            if not (0 <= risk_percentage <= 100):
                logger.error(f"Giá trị risk_percentage không hợp lệ: {risk_percentage}")
                return jsonify({"error": "risk_percentage must be between 0 and 100"}), 400
        except ValueError:
            logger.error(f"Không thể chuyển đổi risk_percentage thành số: {risk_percentage}")
            return jsonify({"error": "risk_percentage must be a number"}), 400
        
        # Gọi hàm lấy lời khuyên từ AI
        logger.info(f"Lấy lời khuyên cho risk_percentage={risk_percentage}")
        return generate_ai_recommendation(risk_percentage)
        
    except Exception as e:
        logger.error(f"Lỗi khi lấy lời khuyên: {str(e)}")
        return jsonify({"error": str(e)}), 500


def generate_ai_recommendation(risk_percentage):
    """
    Gọi API AI để lấy lời khuyên dựa trên % nguy cơ.
    """
    try:
        logger.info(f"Bắt đầu tạo lời khuyên cho risk_percentage={risk_percentage}")
        
        prompt = (
            f"Tôi vừa được chẩn đoán có {risk_percentage}% khả năng mắc bệnh tiểu đường. "
            "Vui lòng trả lời tôi bằng một đối tượng JSON **duy nhất**, có định dạng chính xác như sau:\n\n"
            "{\n"
            "  \"danger_level\": \"Mức độ nguy hiểm\",\n"
            "  \"immediate_actions\": \"Những việc nên làm ngay\",\n"
            "  \"diet\": \"Chế độ ăn phù hợp\",\n"
            "  \"symptoms_to_watch\": \"Các dấu hiệu cần theo dõi\",\n"
            "  \"doctor_visit_timing\": \"Khi nào nên đi khám bác sĩ\",\n"
            "  \"summary\": \"Tóm tắt ngắn gọn về tình trạng\"\n"
            "}\n\n"
            "Chỉ trả về **JSON thuần túy**, không thêm mô tả, markdown hay văn bản khác."
        )

        logger.info("Gửi yêu cầu đến Gemini API")
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        logger.info("Đã nhận phản hồi từ Gemini API")

        raw_text = response.text.strip()
        logger.debug(f"Phản hồi thô từ Gemini: {raw_text}")

        extracted_json = extract_json_from_text(raw_text)
        if not extracted_json:
            logger.error("Không thể trích xuất JSON từ phản hồi của Gemini")
            raise ValueError("Gemini không trả về JSON hợp lệ.")

        advice = json.loads(extracted_json)
        logger.info("Đã phân tích JSON thành công")

        return jsonify({
            "status": "success",
            "advice": advice
        })

    except json.JSONDecodeError as json_err:
        logger.error(f"Lỗi phân tích JSON: {str(json_err)}")
        return jsonify({
            "status": "error",
            "message": "Lỗi phân tích JSON từ Gemini",
            "details": str(json_err),
            "raw_response": raw_text
        }), 500

    except Exception as e:
        logger.error(f"Lỗi khi tạo lời khuyên: {str(e)}")
        return jsonify({'error': str(e)}), 500


def extract_json_from_text(text):
    import re
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group()
    return None


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "api_version": "1.0.0"
    })


if __name__ == '__main__':
    logger.info("Khởi động server Flask trên cổng 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)