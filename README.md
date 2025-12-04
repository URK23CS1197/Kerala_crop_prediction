Kerala Crop Recommender – Deep Learning Based Crop Suggestion System

    This project recommends the Top 5 most suitable crops for any location in Kerala based on soil nutrients and climatic conditions. The model is built using a Multilayer Perceptron (MLP) deep learning architecture trained on a custom dataset curated from 14 districts of Kerala. The system includes a Flask backend for predictions and a modern React frontend for user interaction.

Project Overview

    Agricultural planning depends on understanding which crops will grow best under given soil and weather conditions.
    This system solves that by:

        Creating a dataset linking 14 Kerala districts to their common crops

        Mapping each crop to its average nutrient requirements (N, P, K) and typical environmental preferences

        Training an MLP deep learning model on this dataset

        Providing a Flask API to return ranked crop recommendations
  
        Creating a React-based frontend for easy input and clean visualization

Features

    Machine Learning Model

    Deep Learning MLP (Multilayer Perceptron) classifier

    Trained using nutrient and environmental data

    Produces Top 5 crop suggestions ranked by probability

    Uses saved model + label encoder (joblib)

Dataset

    Includes district-specific crop mapping for 14 Kerala districts:

    Crop names

    Average N, P, K nutrient requirements

    Temperature range

    Humidity

    Soil pH

    Rainfall

Backend (Flask)

    Loads trained model and encoder from crop_pre/

    Endpoints:

        /predict — returns ranked crop list
        
        /health — indicates if the model is loaded correctly
        
        /debug_classes — shows internal class mappings
        
        JSON-based API suitable for any frontend

Frontend (React)

    Clean, responsive input form for:

          Nitrogen
          
          Phosphorus
          
          Potassium
          
          Temperature
          
          Humidity
          
          Soil pH
          
          Rainfall

    Displays:

          Top 5 crops
          
          Suitability percentage
          
          Confidence indicator
          
          Smooth UI animations

Live URLs

    Backend API
        https://kerala-crop-prediction-1.onrender.com
    
    Frontend Web App
        https://kerala-crop-prediction.onrender.com

API Usage

    POST /predict

        Example request:
        
        {
          "nitrogen": 20,
          "phosphorus": 30,
          "potassium": 40,
          "temperature": 28,
          "humidity": 70,
          "ph": 6.5,
          "rainfall": 200
        }


    Example response:

        {
          "success": true,
          "predictions": [
            { "crop": "Sesamum", "probability": 26.0 },
            { "crop": "Rice", "probability": 18.0 }
          ]
        }

    GET /health

        Verifies that the model and label encoder are loaded.

    GET /debug_classes

        Returns:

            label_encoder_classes
            
            model_classes
            
            Useful for debugging mapping order.

Installation & Running Locally

    Backend
        cd backend
        pip install -r requirements.txt
        python app.py

    Frontend
        cd frontend
        npm install
        npm start

Folder Structure

        project/
        │── backend/
        │   ├── app.py
        │   ├── train.py
        │   ├── crop_pre/
        │   │   ├── model.joblib
        │   │   ├── label_encoder.joblib
        │   └── requirements.txt
        │
        │── frontend/
        │   ├── src/App.jsx
        │   ├── package.json
        │
        │── README.md

How It Works (Short Summary)

    The user enters nutrient & climate values

    React sends them to the Flask backend
    
    The MLP model predicts class probabilities for all crops
    
    The backend returns the Top 5 crops
    
    The frontend displays them cleanly, sorted by suitability score

Future Extensions

    Add district selection to adjust predictions
    
    Support multi-season crop rotation
    
    Add fertilizer requirements to close soil–nutrient gaps
    
    Integrate real weather forecasts


Contact

    niransonc@karunya.edu.in
