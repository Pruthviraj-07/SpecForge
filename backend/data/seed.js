const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Hospital = require('../models/hospital.model')

dotenv.config()


const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    await Hospital.deleteMany()
    await Hospital.insertMany(hospitals)
    console.log('Hospitals seeded successfully ✅')
    mongoose.connection.close()
  } catch (error) {
    console.error('Seed error:', error)
  }
}

seedDB()