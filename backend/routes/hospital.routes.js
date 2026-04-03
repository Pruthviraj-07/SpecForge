const express = require("express");
const router = express.Router();
const {
  getAllHospitals,
  updateHospital,
} = require("../controllers/hospital.controller");

router.get("/hospitals", getAllHospitals);
router.put("/hospitals/:id", updateHospital);

module.exports = router;