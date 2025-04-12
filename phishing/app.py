from flask import Flask, request, jsonify
import numpy as np
import pickle
from flask_cors import CORS
from feature import FeatureExtraction

app = Flask(__name__)
CORS(app)

# Load trained model
with open("model.pkl", "rb") as file:
    model = pickle.load(file)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    url = data["url"]

    # Extract features
    obj = FeatureExtraction(url)
    features = np.array(obj.getFeaturesList()).reshape(1, -1)

    # Make prediction
    prediction = model.predict(features)[0]
    confidence = model.predict_proba(features)[0, 1]

    return jsonify({
        "isSafe": True if prediction == 1 else False,
        "confidence": round(confidence * 100, 2)
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
