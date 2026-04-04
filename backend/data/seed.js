const Hospital = require("../models/hospital.model");
const HospitalCode = require("../models/hospitalCode.model");

const hospitals = [
  {
    name: "Ruby Hall Clinic",
    address: "40, Sassoon Road, Pune",
    location: { lat: 18.5314, lng: 73.8446 },
    icu: 3, ventilator: 2, ECG: 5, cardiac: 2,
    oxygen_cylinder: 10, bipap: 3,
    specialists: ["cardiologist", "neurologist"],
    emergencyAvailable: true,
  },
  {
    name: "KEM Hospital Pune",
    address: "Sardar Moodliar Road, Pune",
    location: { lat: 18.5167, lng: 73.8567 },
    icu: 0, ventilator: 0, ECG: 2, cardiac: 0,
    oxygen_cylinder: 5, bipap: 0,
    specialists: ["orthopedic"],
    emergencyAvailable: true,
  },
  {
    name: "Sassoon General Hospital",
    address: "Jai Prakash Narayan Road, Pune",
    location: { lat: 18.5196, lng: 73.8553 },
    icu: 5, ventilator: 4, ECG: 8, cardiac: 3,
    oxygen_cylinder: 15, bipap: 4,
    specialists: ["cardiologist", "neurologist", "orthopedic"],
    emergencyAvailable: true,
  },
  {
    name: "Jehangir Hospital",
    address: "32, Sassoon Road, Pune",
    location: { lat: 18.5362, lng: 73.8862 },
    icu: 2, ventilator: 1, ECG: 4, cardiac: 1,
    oxygen_cylinder: 8, bipap: 2,
    specialists: ["cardiologist"],
    emergencyAvailable: true,
  },
  {
    name: "Deenanath Mangeshkar Hospital",
    address: "Erandwane, Pune",
    location: { lat: 18.5089, lng: 73.8259 },
    icu: 4, ventilator: 3, ECG: 6, cardiac: 2,
    oxygen_cylinder: 12, bipap: 3,
    specialists: ["neurologist", "cardiologist"],
    emergencyAvailable: true,
  },
];

const hospitalCodes = [
  { code: "HOSP-RUBY-001", hospitalName: "Ruby Hall Clinic", city: "Pune" },
  { code: "HOSP-SASS-002", hospitalName: "Sassoon General Hospital", city: "Pune" },
  { code: "HOSP-KEM-003", hospitalName: "KEM Hospital Pune", city: "Pune" },
  { code: "HOSP-JEHA-004", hospitalName: "Jehangir Hospital", city: "Pune" },
  { code: "HOSP-DEEN-005", hospitalName: "Deenanath Mangeshkar Hospital", city: "Pune" },
  // ✅ Dummy code for any new hospital
  { code: "HOSP-NEW-000", hospitalName: "New Hospital", city: "Unknown", isDummy: true },
];

const seedIfEmpty = async () => {
  try {
    // ── Seed hospitals ─────────────────────────────
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount > 0) {
      console.log(`✅ DB already has ${hospitalCount} hospitals — skipping seed.`);
    } else {
      const result = await Hospital.insertMany(hospitals, { ordered: false });
      console.log(`✅ Inserted ${result.length} hospitals`);
    }

    // ── Seed hospital codes ────────────────────────
    const codeCount = await HospitalCode.countDocuments();
    if (codeCount > 0) {
      console.log(`✅ DB already has ${codeCount} hospital codes — skipping seed.`);
    } else {
      await HospitalCode.insertMany(hospitalCodes, { ordered: false });
      console.log(`✅ Inserted ${hospitalCodes.length} hospital codes`);
    }

  } catch (error) {
    console.error("Seed error:", error.message);
  }
};

module.exports = seedIfEmpty;