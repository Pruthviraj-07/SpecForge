import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("data.csv")

# Encode
le_injury = LabelEncoder()
df["InjuryType"] = le_injury.fit_transform(df["InjuryType"])

le_bp = LabelEncoder()
df["BP_Risk"] = le_bp.fit_transform(df["BP_Risk"])

le_emergency = LabelEncoder()
df["EmergencyType"] = le_emergency.fit_transform(df["EmergencyType"])

# Features
X = df[[
    "SpO2",
    "Temperature",
    "ChestPain",
    "InjuryType",
    "Unconscious",
    "Diabetes",
    "BP_Risk"
]]

# Targets
y = df[[
    "EmergencyType",
    "ICU",
    "Ventilator",
    "Surgeon",
    "Oxygen"
]]

# Model
model = MultiOutputClassifier(RandomForestClassifier())
model.fit(X, y)

# Save
joblib.dump(model, "model.pkl")
joblib.dump(le_injury, "le_injury.pkl")
joblib.dump(le_bp, "le_bp.pkl")
joblib.dump(le_emergency, "le_emergency.pkl")

print("✅ Model trained")