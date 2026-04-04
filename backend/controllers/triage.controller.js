const Hospital = require("../models/hospital.model");
const Patient = require("../models/patient.model");
const { getAIDecision } = require("../services/groq.service");
const { getDistances } = require("../services/maps.service");
const { uploadBase64Image } = require("../services/cloudinary.service");

// Single patient triage
const findBestHospital = async (req, res) => {
  try {
    const patientData = req.body;

    // 1. Get all active hospitals
    const hospitals = await Hospital.find({ emergencyAvailable: true });

    // 2. Get real distances from OSRM
    const hospitalsWithDistance = await getDistances(
      patientData.location,
      hospitals
    );

    // 2b. Offload heavy base64 image to Cloudinary and return tiny URL
    if (patientData.scene_image && patientData.scene_image.startsWith("data:image")) {
      console.log("Uploading scene image to Cloudinary for Groq processing...");
      const cloudUrl = await uploadBase64Image(patientData.scene_image);
      if (cloudUrl) {
        patientData.scene_image = cloudUrl; // Replace base64 bulk string with clean URL
      }
    }

    // 3. Get AI decision from Gemini (Groq)
    const decision = await getAIDecision(patientData, hospitalsWithDistance);

    // 4. Save patient record
    const patient = await Patient.create({
      ...patientData,
      severity: decision.severity,
      icu_needed: decision.icu_needed,
      ventilator_needed: decision.ventilator_needed,
      specialist_needed: decision.specialist,
      assigned_hospital: decision.best_hospital,
      eta_minutes: decision.eta_minutes,
      ai_reasoning: decision.reasoning,
      mode: "single",
    });

    // 5. Update hospital availability
    await Hospital.findOneAndUpdate(
      { name: decision.best_hospital },
      {
        $inc: {
          icu: decision.icu_needed ? -1 : 0,
          ventilator: decision.ventilator_needed ? -1 : 0,
        },
      }
    );

    res.json({
      success: true,
      patient_id: patient._id,
      decision,
      hospitals: hospitalsWithDistance,
    });
  } catch (error) {
    console.error("Triage error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mass casualty mode
const massCasualtyTriage = async (req, res) => {
  try {
    const { patients } = req.body;
    const results = [];

    for (const patientData of patients) {
      // Get fresh hospital data for each patient
      const freshHospitals = await Hospital.find({ emergencyAvailable: true });
      const hospitalsWithDistance = await getDistances(
        patientData.location,
        freshHospitals
      );

      const decision = await getAIDecision(patientData, hospitalsWithDistance);

      await Patient.create({
        ...patientData,
        severity: decision.severity,
        icu_needed: decision.icu_needed,
        ventilator_needed: decision.ventilator_needed,
        specialist_needed: decision.specialist,
        assigned_hospital: decision.best_hospital,
        eta_minutes: decision.eta_minutes,
        ai_reasoning: decision.reasoning,
        mode: "mass-casualty",
      });

      // Update hospital beds immediately
      await Hospital.findOneAndUpdate(
        { name: decision.best_hospital },
        {
          $inc: {
            icu: decision.icu_needed ? -1 : 0,
            ventilator: decision.ventilator_needed ? -1 : 0,
          },
        }
      );

      results.push({ patient: patientData, decision });
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { findBestHospital, massCasualtyTriage };