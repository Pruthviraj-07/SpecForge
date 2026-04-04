const express = require("express");
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  updateHospital,
  addHospital,
} = require("../controllers/hospital.controller");
const { protect } = require("../middleware/auth.middleware");

// Public — triage engine can read hospitals
router.get("/", getHospitals);
router.get("/:id", getHospitalById);

// Protected — only linked admin can modify
router.post("/", protect, addHospital);
router.put("/:id", protect, updateHospital);

module.exports = router;