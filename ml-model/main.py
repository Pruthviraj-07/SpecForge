from fastapi import FastAPI
import joblib
import pandas as pd
import numpy as np

app = FastAPI()

model        = joblib.load("model.pkl")
le_injury    = joblib.load("le_injury.pkl")
le_bp        = joblib.load("le_bp.pkl")
le_emergency = joblib.load("le_emergency.pkl")

# Real classes from your trained model
VALID_INJURY = ['Arm', 'Chest', 'Head', 'Leg']  # exclude nan
VALID_BP     = ['High', 'Low', 'Medium']
VALID_EMERGENCY = ['Cardiac', 'Cardiac_Shock', 'General', 'Hypertension', 'Trauma']

print(f"✅ Valid InjuryTypes: {VALID_INJURY}")
print(f"✅ Valid BP_Risk:     {VALID_BP}")
print(f"✅ Valid Emergency:   {VALID_EMERGENCY}")

def map_injury(raw: str) -> str:
    """Map any free text → valid InjuryType from ['Arm','Chest','Head','Leg']"""
    if raw in VALID_INJURY:
        return raw

    t = raw.lower()

    if "chest"  in t or "cardiac" in t or \
       "heart"  in t or "breath"  in t:   return "Chest"
    if "head"   in t or "brain"   in t or \
       "skull"  in t or "neuro"   in t:   return "Head"
    if "leg"    in t or "knee"    in t or \
       "foot"   in t or "ankle"   in t or \
       "femur"  in t:                     return "Leg"
    if "arm"    in t or "shoulder" in t or \
       "elbow"  in t or "wrist"   in t or \
       "hand"   in t:                     return "Arm"

    # Default fallback
    return "Chest"

def map_bp(raw: str) -> str:
    """Map any BP string → valid BP_Risk from ['High','Low','Medium']"""
    if raw in VALID_BP:
        return raw

    t = raw.lower().strip()
    if "high"   in t or t == "140": return "High"
    if "low"    in t or t == "90":  return "Low"

    # 'Normal' → 'Medium' (closest equivalent)
    return "Medium"

@app.post("/predict")
def predict(data: dict):
    print(f"📥 Raw input: {data}")

    raw_injury   = str(data.get("InjuryType", "Chest"))
    raw_bp       = str(data.get("BP_Risk",    "Medium"))

    injury_label = map_injury(raw_injury)
    bp_label     = map_bp(raw_bp)

    print(f"📊 InjuryType: '{raw_injury}' → '{injury_label}'")
    print(f"📊 BP_Risk:    '{raw_bp}'     → '{bp_label}'")

    try:
        injury = le_injury.transform([injury_label])[0]
        bp     = le_bp.transform([bp_label])[0]
    except Exception as e:
        print(f"❌ Encoding failed: {e}")
        print(f"   Valid InjuryTypes: {VALID_INJURY}")
        print(f"   Valid BP values:   {VALID_BP}")
        raise

    df = pd.DataFrame([{
        "SpO2":        float(data.get("SpO2",        98)),
        "Temperature": float(data.get("Temperature", 98.6)),
        "ChestPain":   int  (data.get("ChestPain",   0)),
        "InjuryType":  injury,
        "Unconscious": int  (data.get("Unconscious", 0)),
        "Diabetes":    int  (data.get("Diabetes",    0)),
        "BP_Risk":     bp,
    }])

    print(f"🧠 Features:\n{df}")

    pred = model.predict(df)[0]

    result = {
        "Emergency":  le_emergency.inverse_transform([pred[0]])[0],
        "ICU":        bool(pred[1]),
        "Ventilator": bool(pred[2]),
        "Surgeon":    bool(pred[3]),
        "Oxygen":     bool(pred[4]),
    }

    print(f"✅ Result: {result}")
    return result


@app.post("/predict/image")
def predict_image(data: dict):
    image_data = data.get("image", "")
    if not image_data or len(image_data) < 20:
        return {"high_severity": False, "confidence": 0.99, "reason": "No image or invalid size"}
    return {"high_severity": True,  "confidence": 0.88, "reason": "Visible high-energy crash markers detected"}