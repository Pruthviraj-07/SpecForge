const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', require('./routes/hospital.routes'))
app.use('/api', require('./routes/triage.routes'))

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'HC03 Emergency Triage API Running ✅' })
})

module.exports = app