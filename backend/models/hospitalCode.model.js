const mongoose = require("mongoose");

const hospitalCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  hospitalName: { type: String, required: true },
  city: { type: String },
  isUsed: { type: Boolean, default: false },
  isDummy: { type: Boolean, default: false },
});

module.exports = mongoose.model("HospitalCode", hospitalCodeSchema);