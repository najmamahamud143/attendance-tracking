import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

data = np.array([
    [-45, 8, 300],
    [-48, 9, 400],
    [-52, 10, 350],
    [-58, 11, 500],
    [-62, 13, 700],
    [-44, 14, 250],
    [-95, 23, 4500],
    [-88, 3, 3000],
])

model = IsolationForest(contamination=0.2, random_state=42)
model.fit(data)
joblib.dump(model, "model.joblib")
print("Saved model.joblib")
