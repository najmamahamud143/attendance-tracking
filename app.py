from flask import Flask, jsonify, request
import joblib
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.joblib")
app = Flask(__name__)


def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    from sklearn.ensemble import IsolationForest
    data = np.array([[ -45, 9, 300], [-50, 10, 450], [-42, 8, 250], [-60, 14, 700]])
    model = IsolationForest(contamination=0.15, random_state=42)
    model.fit(data)
    return model


model = load_model()


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/detect")
def detect():
    payload = request.get_json(force=True)
    features = np.array([[
        float(payload.get("rssi", -90)),
        float(payload.get("checkin_hour", 0)),
        float(payload.get("response_latency_ms", 0)),
    ]])
    prediction = model.predict(features)[0]
    score = abs(float(model.decision_function(features)[0]))
    anomaly = prediction == -1
    reason_parts = []
    if payload.get("checkin_hour", 0) < 7 or payload.get("checkin_hour", 0) > 20:
        reason_parts.append("unusual check-in hour")
    if payload.get("rssi", -90) < -75:
        reason_parts.append("low RSSI")
    if payload.get("response_latency_ms", 0) > 2000:
        reason_parts.append("high response latency")
    return jsonify({
        "anomaly": bool(anomaly),
        "confidence": min(0.99, round(score, 2)),
        "reason": " + ".join(reason_parts) or "model score outside normal range",
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
