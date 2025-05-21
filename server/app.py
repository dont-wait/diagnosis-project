from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from dotenv import load_dotenv
import google.generativeai as genai
import os
import json

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
genai.configure(api_key = api_key)

app = Flask(__name__)
CORS(app)
model = joblib.load("../models/modelV2.pth")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        required_fields = [
            'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness',
            'insulin', 'bmi', 'diabetes_pedigree', 'age'
        ]
        #Kiem tra du lieu
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        input_features = [
            data['pregnancies'],
            data['glucose'],
            data['blood_pressure'],
            data['skin_thickness'],
            data['insulin'],
            data['bmi'],
            data['diabetes_pedigree'],
            data['age']
        ]

        input_array = np.array([input_features])

        probabilities = model.predict_proba(input_array)[0]  # [P(0), P(1)]
        risk_percentage = round(probabilities[1] * 100, 2)   # Xác suất bị tiểu đường (%)
        predicted_label = 1 if risk_percentage >= 50 else 0  # Chuan doan bị tiểu đường nếu xác suất >= 70%

        ai_result = get_ai_recommendation(risk_percentage)
        return ai_result
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_ai_recommendation(risk_percentage):
    try:
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

        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)

        raw_text = response.text.strip()

        extracted_json = extract_json_from_text(raw_text)
        if not extracted_json:
            raise ValueError("Gemini không trả về JSON hợp lệ.")

        advice = json.loads(extracted_json)

        return jsonify({
            "status": "success",
            "risk_percentage": risk_percentage,
            "advice": advice
        })

    except json.JSONDecodeError as json_err:
        return jsonify({
            "status": "error",
            "message": "Lỗi phân tích JSON từ Gemini",
            "details": str(json_err),
            "raw_response": raw_text
        }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def extract_json_from_text(text):
    import re
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group()
    return None


if __name__ == '__main__':
    app.run(port=5000)
