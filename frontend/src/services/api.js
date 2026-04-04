import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// Get all hospitals
export const getHospitals = async () => {
  const response = await API.get('/hospitals')
  return response.data
}

// Single patient triage
export const triagePatient = async (patientData) => {
  const response = await API.post('/triage', patientData)
  return response.data
}

// Mass casualty triage
export const massCasualtyTriage = async (patients) => {
  const response = await API.post('/triage/mass-casualty', { patients })
  return response.data
}

// Update hospital
export const updateHospital = async (id, data) => {
  const response = await API.put(`/hospitals/${id}`, data)
  return response.data
}

export default API