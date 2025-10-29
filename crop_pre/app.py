from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# Global variables for model
rf_model = None
label_encoder = None

# Load model at startup
def load_model():
    global rf_model, label_encoder
    try:
        model_path = 'crop_rf_model.joblib'
        encoder_path = 'label_encoder.joblib'

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not os.path.exists(encoder_path):
            raise FileNotFoundError(f"Label encoder not found: {encoder_path}")

        rf_model = joblib.load(model_path)
        label_encoder = joblib.load(encoder_path)
        logger.info("Model and label encoder loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        rf_model, label_encoder = None, None

# Load model on startup
load_model()

@app.route('/')
def index():
    return render_template('enhanced-index.html')

@app.route('/predict', methods=['POST'])
def predict_crop():
    global rf_model, label_encoder

    # Check if model is loaded
    if rf_model is None or label_encoder is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded. Please check server logs.'
        }), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data received. Send JSON.'
            }), 400

        # Required fields
        required_fields = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({
                'success': False,
                'error': f"Missing fields: {', '.join(missing)}"
            }), 400

        # Validate and convert inputs
        try:
            features = [
                float(data['nitrogen']),
                float(data['phosphorus']),
                float(data['potassium']),
                float(data['temperature']),
                float(data['humidity']),
                float(data['ph']),
                float(data['rainfall'])
            ]
        except ValueError as ve:
            return jsonify({
                'success': False,
                'error': f"Invalid number format: {str(ve)}"
            }), 400

        # Optional: Add range validation
        validations = [
            (0, 300, features[0], 'Nitrogen'),
            (0, 200, features[1], 'Phosphorus'),
            (0, 400, features[2], 'Potassium'),
            (10, 45, features[3], 'Temperature'),
            (0, 100, features[4], 'Humidity'),
            (4, 9, features[5], 'pH'),
            (0, 3000, features[6], 'Rainfall')
        ]

        for min_val, max_val, value, name in validations:
            if not (min_val <= value <= max_val):
                return jsonify({
                    'success': False,
                    'error': f"{name} must be between {min_val} and {max_val}. Got {value}."
                }), 400

        # Create DataFrame
        feature_names = ['N', 'P', 'K', 'Temperature', 'Humidity', 'pH', 'Rainfall']
        input_df = pd.DataFrame([features], columns=feature_names)

        # Predict probabilities
        probabilities = rf_model.predict_proba(input_df)[0]
        classes = label_encoder.inverse_transform(range(len(probabilities)))

        # Get top 5
        prob_pairs = sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True)[:5]

        # Format results
        results = [
            {'crop': crop, 'probability': round(prob * 100, 2)}
            for crop, prob in prob_pairs
        ]

        logger.info(f"Prediction successful: {results[0]['crop']} ({results[0]['probability']}%)")

        return jsonify({
            'success': True,
            'predictions': results
        })

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error. Check input data.'
        }), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': rf_model is not None
    })

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Make sure 'crop_rf_model.joblib' and 'label_encoder.joblib' are in this folder!")
    app.run(host='0.0.0.0', port=5000, debug=False)