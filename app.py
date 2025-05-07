from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
app = Flask(__name__)
CORS(app)

model = joblib.load("../DiabetesDiagnosis/models/modelV2.pth")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        required_fields = [
            'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness',
            'insulin', 'bmi', 'diabetes_pedigree', 'age'
        ]
        
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

        return jsonify({
            "risk_percentage": risk_percentage,
            "predicted_label": predicted_label
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
