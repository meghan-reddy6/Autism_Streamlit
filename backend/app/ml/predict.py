import joblib
import numpy as np
import os
import typing
import logging

logger = logging.getLogger(__name__)

# Path: backend/tabc_model.joblib (relative to this file)
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "tabc_model.joblib"
)

class MLModelService:
    """Encapsulates ML Model loading and inference to prevent global state leaks."""
    
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.model_classes: typing.Optional[list] = None
        self.reload_model()

    def reload_model(self) -> tuple[bool, str]:
        """Attempt to (re)load the model from `model_path`."""
        try:
            self.model = joblib.load(self.model_path)
            try:
                self.model_classes = list(self.model.classes_)
            except Exception:
                self.model_classes = None
            msg = f"Machine Learning Model loaded successfully from {self.model_path}"
            logger.info(msg)
            return True, msg
        except Exception as e:
            self.model = None
            self.model_classes = None
            msg = f"Failed to load ML model. Ensure scripts/train_model.py has been run. Error: {e}"
            logger.warning(msg)
            return False, msg

    def _validate_scores(self, scores: list) -> tuple[bool, str, np.ndarray | None]:
        if not isinstance(scores, (list, tuple, np.ndarray)):
            return False, "Scores must be a list of exactly 20 integers between 1 and 4", None
        if len(scores) != 20:
            return False, "Expected exactly 20 scores", None
        try:
            arr = np.array([int(x) for x in scores], dtype=int).reshape(1, -1)
        except Exception:
            return False, "Scores must be integers", None
        if arr.min() < 1 or arr.max() > 4:
            return False, "Scores values must be between 1 and 4", None
        return True, "ok", arr

    @staticmethod
    def get_rule_based_interpretation(total_score: int) -> str:
        """Static rule-based fallback logic (TABC rules)."""
        if 20 <= total_score <= 35:
            return "Non Autistic"
        elif 36 <= total_score <= 43:
            return "Mildly-Moderately Autistic"
        elif total_score >= 44:
            return "Severely Autistic"
        else:
            return "Invalid score range"

    def predict_autism(self, scores: list) -> str:
        """
        Predicts an interpretation string from 20 integer scores (1-4).
        Returns a human-friendly label. Falls back to rule-based scoring if model is absent.
        """
        valid, msg, X_pred = self._validate_scores(scores)
        if not valid:
            return f"Invalid Data: {msg}"

        # Rule-based fallback if ML model isn't loaded
        if self.model is None:
            return self.get_rule_based_interpretation(int(np.sum(X_pred)))

        # ML Inference
        try:
            pred = self.model.predict(X_pred)
            label = str(pred[0])
            
            # Attach confidence probability if the model supports it
            proba = None
            try:
                probs = self.model.predict_proba(X_pred)
                proba = float(np.max(probs))
            except Exception:
                pass
            
            if proba is not None:
                return f"{label} ({proba:.2f})"
            return label
            
        except Exception as e:
            logger.error(f"Model prediction failed, falling back to rules. Error: {e}")
            return self.get_rule_based_interpretation(int(np.sum(X_pred)))

# Singleton instance exported for use in routes
ml_service = MLModelService()
