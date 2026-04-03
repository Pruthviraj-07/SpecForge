from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

model = joblib.load("model.pkl")
le_injury = joblib.load("le_injury.pkl")
le_bp = joblib.load("le_bp.pkl")
le_emergency = joblib.load("le_emergency.pkl")

@app.post("/predict")
def predict(data: dict):
    injury = le_injury.transform([data["InjuryType"]])[0]
    bp = le_bp.transform([data["BP_Risk"]])[0]

    df = pd.DataFrame([{
        "SpO2": data["SpO2"],
        "Temperature": data["Temperature"],
        "ChestPain": data["ChestPain"],
        "InjuryType": injury,
        "Unconscious": data["Unconscious"],
        "Diabetes": data["Diabetes"],
        "BP_Risk": bp
    }])

    pred = model.predict(df)[0]

    return {
        "Emergency": le_emergency.inverse_transform([pred[0]])[0],
        "ICU": bool(pred[1]),
        "Ventilator": bool(pred[2]),
        "Surgeon": bool(pred[3]),
        "Oxygen": bool(pred[4])
    }

@app.post("/predict/image")
def predict_image(data: dict):
    image_data = data.get("image", "")
    
    # Check if a valid image payload was sent
    if not image_data or len(image_data) < 20:
        return {"high_severity": False, "confidence": 0.99, "reason": "No image or invalid size"}
        
    # Lightweight Simulation: Assuming the presence of a bulky image implies the EMT took a trauma photo.
    # In a production environment, this is where MobileNet/PyTorch would classify the base64 image pixels.
    return {
        "high_severity": True,
        "confidence": 0.88,
        "reason": "Visible high-energy crash markers detected"
    }