require('dotenv').config({ path: '../.env' })
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Hospital = require("../models/hospital.model");

dotenv.config();

const hospitals = [
  {
    name: "Ruby Hall Clinic",
    address: "40, Sassoon Road, Pune",
    location: { lat: 18.5314, lng: 73.8446 },
    icu: 3,
    ventilator: 2,
    ECG: 5,
    cardiac: 2,
    oxygen_cylinder: 10,
    bipap: 3,
    specialists: ["cardiologist", "neurologist"],
    emergencyAvailable: true,
  },
  {
    name: "KEM Hospital Pune",
    address: "Sardar Moodliar Road, Pune",
    location: { lat: 18.5167, lng: 73.8567 },
    icu: 0,
    ventilator: 0,
    ECG: 2,
    cardiac: 0,
    oxygen_cylinder: 5,
    bipap: 0,
    specialists: ["orthopedic"],
    emergencyAvailable: true,
  },
  {
    name: "Sassoon General Hospital",
    address: "Jai Prakash Narayan Road, Pune",
    location: { lat: 18.5196, lng: 73.8553 },
    icu: 5,
    ventilator: 4,
    ECG: 8,
    cardiac: 3,
    oxygen_cylinder: 15,
    bipap: 4,
    specialists: ["cardiologist", "neurologist", "orthopedic"],
    emergencyAvailable: true,
  },
  {
    name: "Jehangir Hospital",
    address: "32, Sassoon Road, Pune",
    location: { lat: 18.5362, lng: 73.8862 },
    icu: 2,
    ventilator: 1,
    ECG: 4,
    cardiac: 1,
    oxygen_cylinder: 8,
    bipap: 2,
    specialists: ["cardiologist"],
    emergencyAvailable: true,
  },
  {
    name: "Deenanath Mangeshkar Hospital",
    address: "Erandwane, Pune",
    location: { lat: 18.5089, lng: 73.8259 },
    icu: 4,
    ventilator: 3,
    ECG: 6,
    cardiac: 2,
    oxygen_cylinder: 12,
    bipap: 3,
    specialists: ["neurologist", "cardiologist"],
    emergencyAvailable: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Hospital.deleteMany();
    await Hospital.insertMany(hospitals);
    console.log("Hospitals seeded successfully ✅");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seed error:", error);
  }
};

seedDB();