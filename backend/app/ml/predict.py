import joblib
import numpy as np
import os
import typing

# Path: backend/tabc_model.joblib (relative to this file)
model_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "tabc_model.joblib"
)

# Load model if it exists and capture metadata
model = None
model_classes: typing.Optional[list] = None


def reload_model() -> tuple[bool, str]:
    """Attempt to (re)load the model from `model_path` into module globals.
    Returns (success, message).
    """
    global model, model_classes
    try:
        model = joblib.load(model_path)
        try:
            model_classes = list(model.classes_)
        except Exception:
            model_classes = None
        msg = f"Machine Learning Model loaded successfully from {model_path}"
        print(msg)
        if model_classes:
            print("Model classes:", model_classes)
        return True, msg
    except Exception as e:
        model = None
        model_classes = None
        msg = f"Failed to load ML model. Ensure scripts/train_model.py has been run. Error: {e}"
        print(msg)
        return False, msg


# Load on import if present
_loaded, _msg = reload_model()


def _validate_scores(scores: list) -> tuple[bool, str, np.ndarray | None]:
    if not isinstance(scores, (list, tuple, np.ndarray)):
        return False, "Scores must be a list of 20 integers between 1 and 4", None
    if len(scores) != 20:
        return False, "Expected 20 scores", None
    try:
        arr = np.array([int(x) for x in scores], dtype=int).reshape(1, -1)
    except Exception:
        return False, "Scores must be integers", None
    if arr.min() < 1 or arr.max() > 4:
        return False, "Scores values must be between 1 and 4", None
    return True, "ok", arr


def predict_autism(scores: list) -> str:
    """
    Predicts an interpretation string from 20 integer scores (1-4).
    Returns a human-friendly label. If model is not available, returns a fallback
    based on rule-based scoring.
    """
    # Validate input
    valid, msg, X_pred = _validate_scores(scores)
    if not valid:
        return f"Invalid Data: {msg}"

    # If model is not loaded, return rule-based fallback
    if model is None:
        total = int(np.sum(X_pred))
        if 20 <= total <= 35:
            return "Non Autistic"
        elif 36 <= total <= 43:
            return "Mildly-Moderately Autistic"
        elif total >= 44:
            return "Severely Autistic"
        else:
            return "Invalid score range"

    # Use model prediction; include probability if available
    try:
        pred = model.predict(X_pred)
        label = str(pred[0])
        # Attach confidence/proba when available
        proba = None
        try:
            probs = model.predict_proba(X_pred)
            proba = float(np.max(probs))
        except Exception:
            proba = None
        if proba is not None:
            return f"{label} ({proba:.2f})"
        return label
    except Exception as e:
        # As a last resort, fall back to rule-based
        print("Model prediction failed, falling back to rule-based. Error:", e)
        total = int(np.sum(X_pred))
        if 20 <= total <= 35:
            return "Non Autistic"
        elif 36 <= total <= 43:
            return "Mildly-Moderately Autistic"
        elif total >= 44:
            return "Severely Autistic"
        else:
            return "Invalid score range"
