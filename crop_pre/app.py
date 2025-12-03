from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Debug: List files to verify model presence
print("Files in deployment directory:", os.listdir('.'))
if os.path.isdir('crop_pre'):
    print("Files in crop_pre directory:", os.listdir('crop_pre'))
else:
    print("Warning: 'crop_pre' directory not found")

# Load model and encoder
model = None
label_encoder = None
try:
    model = joblib.load('crop_pre/crop_rf_model.joblib')
    print("Model loaded: crop_pre/crop_rf_model.joblib")
except Exception as e:
    print(f"Model load error: {e}")

try:
    label_encoder = joblib.load('crop_pre/label_encoder.joblib')
    print("Label encoder loaded: crop_pre/label_encoder.joblib")
except Exception as e:
    print(f"Label encoder load error: {e}")

@app.route('/')
def index():
    return jsonify({
        "message": "Kerala Crop Recommender API",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "debug_classes": "/debug_classes"
        }
    })

@app.route('/health')
def health():
    healthy = model is not None
    encoder_ok = label_encoder is not None
    status = "healthy" if healthy and encoder_ok else "error"
    code = 200 if healthy and encoder_ok else 500
    return jsonify({"status": status, "model_loaded": healthy, "label_encoder_loaded": encoder_ok}), code

@app.route('/debug_classes')
def debug_classes():
    try:
        model_cl = model.classes_.tolist() if model is not None and hasattr(model, 'classes_') else None
        le_cl = label_encoder.classes_.tolist() if label_encoder is not None and hasattr(label_encoder, 'classes_') else None
        return jsonify({
            "model_classes": model_cl,
            "label_encoder_classes": le_cl
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({"success": False, "error": "Model not loaded"}), 500

        data = request.get_json(force=True)
        # Ensure all keys are present
        expected_keys = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
        if not data or not all(key in data for key in expected_keys):
            return jsonify({"success": False, "error": "Missing or incorrect input keys"}), 400

        # Build features array
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
        except Exception as e:
            return jsonify({"success": False, "error": f"Invalid input types: {e}"}), 400

        features_array = np.array([features])

        # Predict probabilities
        probs = model.predict_proba(features_array)[0]  # shape (n_classes,)

        # Get top 5 class positions (indices in probs/model.classes_)
        top5_pos = probs.argsort()[-5:][::-1]

        predictions = []
        for pos in top5_pos:
            # Map position -> encoded_class (actual class value the model uses)
            try:
                encoded_class = model.classes_[pos]
            except Exception as e:
                # Defensive fallback
                print(f"Error reading model.classes_[{pos}]: {e}")
                encoded_class = pos

            # Try to decode to original string label using label_encoder if available
            crop_label = None
            if label_encoder is not None:
                try:
                    # label_encoder.inverse_transform expects an array-like of encoded labels
                    # If encoded_class is numeric and matches the encoding, this will work.
                    crop_label = label_encoder.inverse_transform([encoded_class])[0]
                except Exception as e:
                    # Could fail if encoded_class is already a string (or mismatch)
                    print(f"Label decode error for {encoded_class}: {e}")
                    # If encoded_class is a string, maybe it's already the original label
                    try:
                        crop_label = str(encoded_class)
                    except:
                        crop_label = f"class_{encoded_class}"
            else:
                # No label encoder saved: fall back to model.classes_ value as string
                crop_label = str(encoded_class)

            # Probability as percent
            prob_pct = float(probs[pos]) * 100.0
            prob_pct = round(prob_pct, 2)

            # UI-friendly cleaned label (remove "Leaf " prefix if present)
            display_label = crop_label.replace("Leaf ", "").strip()

            predictions.append({
                "crop": crop_label,            # original label as decoded (or fallback)
                "display": display_label,      # cleaned friendly label for UI
                "probability": prob_pct
            })

        return jsonify({"success": True, "predictions": predictions})
    except Exception as e:
        print("Prediction error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # debug=False in production; set to True locally if needed
    app.run(host='0.0.0.0', port=port, debug=False)
