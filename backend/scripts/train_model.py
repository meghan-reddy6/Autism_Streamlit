import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# The logic:
# 20 questions, score 1-4 per question. Total score: 20-80.
# 20-35 Non Autistic
# 36-43 Mildly-Moderately Autistic
# 44+ Severely Autistic

num_samples = 5000
np.random.seed(42)

# Generate synthetic responses (scores between 1 and 4 for 20 questions)
# We skew the distribution a bit to get a good span of totals

X = np.random.randint(1, 5, size=(num_samples, 20))

# Calculate the labels based on the exact logic
y = []
for row in X:
    total = np.sum(row)
    if total <= 35:
        y.append("Non Autistic")
    elif total <= 43 and total >= 36:
        y.append("Mildly-Moderately Autistic")
    else:
        y.append("Severely Autistic")

y = np.array(y)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

accuracy = model.score(X, y)
print(f"Model trained successfully. Accuracy on synthetic data: {accuracy*100:.2f}%")

save_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "tabc_model.joblib")
joblib.dump(model, save_path)
print(f"Model saved to {save_path}")
