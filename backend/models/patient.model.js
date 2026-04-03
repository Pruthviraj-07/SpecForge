const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    age: {
      type: Number,
      required: true,
    },
    heartRate: {
      type: Number,
      required: true,
    },
    spo2: {
      type: Number,
      required: true,
    },
    bloodPressure: {
      type: String,
      required: true,
    },
    symptoms: [
      {
        type: String,
      },
    ],
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    severity: {
      type: String,
      enum: ["Critical", "Moderate", "Mild"],
    },
    icu_needed: {
      type: Boolean,
      default: false,
    },
    ventilator_needed: {
      type: Boolean,
      default: false,
    },
    specialist_needed: {
      type: String,
      default: "none",
    },
    assigned_hospital: {
      type: String,
    },
    eta_minutes: {
      type: Number,
    },
    ai_reasoning: {
      type: String,
    },
    mode: {
      type: String,
      enum: ["single", "mass-casualty"],
      default: "single",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);