from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Print current directory files for debugging
print("Files in deployment directory:", os.listdir('.'))

# Load model and encoder
try:
    model = joblib.load('crop_rf_model.joblib')
    label_encoder = joblib.load('label_encoder.joblib')
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
    if 'model' in globals() and 'label_encoder' in globals():
        return jsonify({"status": "healthy", "model_loaded": True})
    else:
        return jsonify({"status": "error", "model_loaded": False}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = [
            data['N'], data['P'], data['K'],
            data['temperature'], data['humidity'],
            data['ph'], data['rainfall']
        ]
        features_array = np.array([features])
        probs = model.predict_proba(features_array)[0]
        top5_idx = probs.argsort()[-5:][::-1]
        predictions = []
        for idx in top5_idx:
            crop = label_encoder.inverse_transform([idx])[0]
            prob = probs[idx]
            predictions.append({"crop": crop, "probability": round(prob, 4)})
        return jsonify({"success": True, "predictions": predictions})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
