import joblib
import numpy as np
import os

model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "tabc_model.joblib")

# Load model if it exists
try:
    model = joblib.load(model_path)
    print("Machine Learning Model loaded successfully from", model_path)
except Exception as e:
    print("Failed to load ML model. Ensure scripts/train_model.py has been run. Error:", e)
    model = None

def predict_autism(scores: list[int]) -> str:
    """
    Takes exactly 20 integer scores (1-4) representing the TABC answers.
    Returns the severity string predicted by the ML model.
    """
    if not model:
        return "Model Offline"
    
    if len(scores) != 20:
        return "Invalid Data Shape"

    # Convert to 2D numpy array for sklearn
    X_pred = np.array(scores).reshape(1, -1)
    
    # Predict
    prediction = model.predict(X_pred)
    return str(prediction[0])
