import joblib
import pandas as pd
import re
import string
import os
from typing import Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Application Setup ---
app = Flask(__name__)
CORS(app) # Allows the React frontend to communicate with this API

# --- Helper: text cleaning (same as original) ---
def clean_text(text: str) -> str:
    """Clean symptom text for prediction/validation."""
    text = str(text).lower()
    text = re.sub(r'\d+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# --- Initialization: Load Models, Vectorizer, and Validation Data ---

# Define file paths (assuming all files are in the same directory)
DATA_PATH = "MediLink_Symptom_Chatbot_Dataset_Updated (1).csv"
SYMPTOM_COL = 'symptom_text' # Based on your CSV snippet

vectorizer = None
disease_model = None
doctor_model = None
urgency_model = None
valid_symptom_set = set()

def load_assets():
    """Loads all ML models, vectorizer, and symptom validation data."""
    global vectorizer, disease_model, doctor_model, urgency_model, valid_symptom_set
    
    # 1. Load ML Models and Vectorizer
    try:
        vectorizer = joblib.load("tfidf_vectorizer.pkl")
        disease_model = joblib.load("disease_rf_model.pkl")
        doctor_model = joblib.load("doctor_rf_model.pkl")
        urgency_model = joblib.load("urgency_rf_model.pkl")
        print("✅ All models and vectorizer loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading model files: {e}")
        # In a production environment, you might raise an error to halt the service

    # 2. Load Dataset for Symptom Validation
    try:
        if not os.path.exists(DATA_PATH):
            print(f"⚠️ Warning: Dataset file not found at {DATA_PATH}. Symptom validation will be skipped.")
            return # Stop validation if file is missing
            
        df = pd.read_csv(DATA_PATH)
        
        # Build the set of valid, cleaned symptoms (replicating your original logic)
        for raw in df[SYMPTOM_COL].dropna().astype(str):
            parts = re.split(r'[,\n;]+', raw)
            for p in parts:
                p_clean = clean_text(p)
                if p_clean:
                    valid_symptom_set.add(p_clean)
        print(f"✅ Symptom validation set built with {len(valid_symptom_set)} unique symptoms.")

    except Exception as e:
        print(f"❌ Error loading or processing dataset for validation: {e}")

# Call the loading function immediately when the API starts
load_assets()

# --- API Endpoint ---
@app.route('/predict', methods=['POST'])
def predict() -> tuple[Dict[str, Any], int]:
    """Receives symptom text via POST request, validates, and predicts."""
    
    # 1. Get input
    data = request.get_json(silent=True)
    if not data or 'symptoms' not in data:
        return jsonify({"error": "Symptom text missing in request body (expected key: 'symptoms')"}), 400

    symptoms_input = data['symptoms']
    
    if vectorizer is None:
        return jsonify({"error": "ML models failed to load. Service unavailable."}), 503

    # 2. Symptom Validation (Replicating the core logic from Streamlit)
    cleaned_input_for_vector = clean_text(symptoms_input)
    
    if valid_symptom_set:
        # Split input into tokens by common separators
        input_parts = [s.strip() for s in re.split(r'[,\n;]+', symptoms_input) if s.strip() != ""]
        cleaned_input_tokens = [clean_text(p) for p in input_parts if clean_text(p) != ""]
        
        # Fallback: if no tokens found, try splitting by space
        if not cleaned_input_tokens:
            cleaned_input_tokens = [t for t in cleaned_input_for_vector.split() if t]
            
        # Check for invalid symptoms
        invalid = [sym for sym in cleaned_input_tokens if sym not in valid_symptom_set]

        if invalid:
            # Return an error if unknown symptoms are found
            return jsonify({
                "error": f"Wrong or unknown symptom(s): {', '.join(invalid)}.",
                "info": "Please ensure you enter valid symptoms."
            }), 422 # 422 Unprocessable Entity
    
    # 3. Prediction
    try:
        vectorized = vectorizer.transform([cleaned_input_for_vector])
        
        disease_pred = disease_model.predict(vectorized)[0]
        doctor_pred = doctor_model.predict(vectorized)[0]
        urgency_pred = urgency_model.predict(vectorized)[0]

        # 4. Return results
        return jsonify({
            "disease": str(disease_pred),
            "doctor_type": str(doctor_pred),
            "urgency": str(urgency_pred)
        }), 200

    except Exception as e:
        print(f"Prediction failed: {e}")
        return jsonify({"error": f"Prediction failed due to internal model error: {str(e)}"}), 500


if __name__ == '__main__':
    # Run the Flask app on a dedicated port (e.g., 5000)
    app.run(port=5000, debug=True)