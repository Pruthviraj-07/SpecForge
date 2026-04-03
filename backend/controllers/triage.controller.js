const mapSeverity = (emergency) => {
  if (!emergency) return "Moderate";

  const lower = emergency.toLowerCase();
  if (lower.includes("cardiac") || lower.includes("shock") || lower.includes("trauma")) return "Critical";

  return "Mild";
};
const { getPrediction, analyzeSceneImage } = require("../services/ml.service");
const Hospital = require("../models/hospital.model");
const Patient = require("../models/patient.model");
const { getDistances } = require("../services/maps.service");

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

    // 3. Get AI decision from Gemini
    // Check scene image before standard routing
    let routeHospitals = hospitalsWithDistance;
    let overrideReason = "";

    if (patientData.scene_image) {
      const imageAnalysis = await analyzeSceneImage(patientData.scene_image);
      if (imageAnalysis.high_severity) {
        // Filter for Trauma centers
        const traumaCenters = routeHospitals.filter((h) =>
          h.specialists && h.specialists.some(s => s.toLowerCase() === "trauma")
        );
        if (traumaCenters.length > 0) {
          routeHospitals = traumaCenters;
          overrideReason = " (OVERRIDE: Scene image detected high trauma severity, routing to Level 1 Trauma Center)";
        }
      }
    }

    // 3. Get ML prediction
    const prediction = await getPrediction(patientData);

    // Sort by closest distance to select the best hospital
    routeHospitals.sort((a, b) => a.eta_minutes - b.eta_minutes);

    // Convert ML output to your system format
    const decision = {
      severity: mapSeverity(prediction.Emergency),
      icu_needed: prediction.ICU,
      ventilator_needed: prediction.Ventilator,
      specialist: prediction.Surgeon ? "required" : "general",

      // Pick correctly filtered hospital
      best_hospital: routeHospitals[0]?.name,
      eta_minutes: routeHospitals[0]?.eta_minutes || 10,

      reasoning: "Decision generated using ML model" + overrideReason
    };

    // 4. Save patient record
    const patient = await Patient.create({
      // ✅ map correct fields for DB
      spo2: patientData.SpO2,
      heartRate: patientData.heartRate || 100,
      bloodPressure: patientData.bp || 120,
      age: patientData.age || 30,

      location: patientData.location,

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

      let routeHospitals = hospitalsWithDistance;
      let overrideReason = "";

      if (patientData.scene_image) {
        const imageAnalysis = await analyzeSceneImage(patientData.scene_image);
        if (imageAnalysis.high_severity) {
          const traumaCenters = routeHospitals.filter((h) =>
            h.specialists && h.specialists.some(s => s.toLowerCase() === "trauma")
          );
          if (traumaCenters.length > 0) {
            routeHospitals = traumaCenters;
            overrideReason = " (OVERRIDE: Level 1 Trauma Directed)";
          }
        }
      }

      const prediction = await getPrediction(patientData);

      routeHospitals.sort((a, b) => a.eta_minutes - b.eta_minutes);

      const decision = {
        severity: mapSeverity(prediction.Emergency),
        icu_needed: prediction.ICU,
        ventilator_needed: prediction.Ventilator,
        specialist: prediction.Surgeon ? "required" : "general",
        best_hospital: routeHospitals[0]?.name,
        eta_minutes: routeHospitals[0]?.eta_minutes || 10,
        reasoning: "Decision generated using ML model" + overrideReason
      };

      await Patient.create({
        spo2: patientData.SpO2,
        heartRate: patientData.heartRate || 100,
        bloodPressure: patientData.bp || 120,
        age: patientData.age || 30,
        location: patientData.location,
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