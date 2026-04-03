const express = require("express");
const router = express.Router();
const {
  findBestHospital,
  massCasualtyTriage,
} = require("../controllers/triage.controller");

router.post("/triage", findBestHospital);
router.post("/triage/mass-casualty", massCasualtyTriage);

module.exports = router;