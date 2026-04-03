const Hospital = require("../models/hospital.model");

// Get all hospitals
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ emergencyAvailable: true });
    res.json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update hospital availability
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllHospitals, updateHospital };