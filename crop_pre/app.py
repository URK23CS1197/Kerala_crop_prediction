from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Debug: List files to verify model presence
print("Files in deployment directory:", os.listdir('.'))
print("Files in crop_pre directory:", os.listdir('crop_pre'))

# Load model and encoder
try:
    model = joblib.load('crop_pre/crop_rf_model.joblib')
    label_encoder = joblib.load('crop_pre/label_encoder.joblib')
    print("Model & encoder loaded")
except Exception as e:
    print(f"Load error: {e}")

@app.route('/')
def index():
    return jsonify({
        "message": "Kerala Crop Recommender API",
        "endpoints": {
            "health": "/health",
            "predict": "/predict"
        }
    })

@app.route('/health')
def health():
    healthy = model is not None and label_encoder is not None
    return jsonify({"status": "healthy" if healthy else "error", "model_loaded": healthy}), 200 if healthy else 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        # Ensure all keys are present
        expected_keys = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
        if not data or not all(key in data for key in expected_keys):
            return jsonify({"success": False, "error": "Missing or incorrect input keys"}), 400

        features = [
            float(data['nitrogen']),
            float(data['phosphorus']),
            float(data['potassium']),
            float(data['temperature']),
            float(data['humidity']),
            float(data['ph']),
            float(data['rainfall'])
        ]
        features_array = np.array([features])
        probs = model.predict_proba(features_array)[0]
        top5_idx = probs.argsort()[-5:][::-1]
        predictions = []
        for idx in top5_idx:
            crop = label_encoder.inverse_transform([idx])[0]
            prob = probs[idx] * 100  # Convert to percent
            predictions.append({"crop": crop, "probability": round(prob, 2)})
        return jsonify({"success": True, "predictions": predictions})
    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
