const Hospital = require("../models/hospital.model");
const Admin = require("../models/admin.model");

const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({ success: true, hospitals });
  } catch (error) {
    console.error("GET HOSPITALS ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }
    res.json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Only the admin whose hospitalAffiliation matches the hospital name can update
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found" });
    }

    if (hospital.name !== req.admin.hospitalAffiliation) {
      return res.status(403).json({
        success: false,
        message: "Access denied — you can only update your own hospital",
      });
    }

    const updated = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, hospital: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Only dummy-code admins who haven't added a hospital yet can add one
const addHospital = async (req, res) => {
  try {
    if (req.admin.hospitalCode !== "HOSP-NEW-000") {
      return res.status(403).json({
        success: false,
        message: "Access denied — you can only manage your own hospital",
      });
    }

    const hospital = await Hospital.create(req.body);

    // Sync admin's affiliation to the newly created hospital name
    await Admin.findByIdAndUpdate(
      req.admin._id,
      { hospitalAffiliation: hospital.name },
      { new: true }
    );

    res.status(201).json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHospitals, getHospitalById, updateHospital, addHospital };