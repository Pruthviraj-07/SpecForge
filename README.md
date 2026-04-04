# 🚑 HC-03 Golden Route – AI-Powered Emergency Triage & Hospital Routing System

## 📌 Overview
Golden Route is an intelligent emergency response system designed to optimize decision-making during the **critical golden hour**.  

It helps:
- Assess patient condition quickly  
- Recommend the most suitable hospital  
- Minimize delay using real-time routing  

The system leverages **AI-driven decision logic and real-time data** to improve emergency outcomes.

---

## 🚀 Features

### 🧠 AI-Powered Triage System
- Uses AI-based decision logic to:
  - Estimate patient severity  
  - Determine ICU & ventilator needs  
  - Suggest required specialist  
- Provides reasoning for decisions (explainable AI)

---

### 🏥 Smart Hospital Routing
- Selects the best hospital based on:
  - ICU availability  
  - Ventilator availability  
  - Emergency readiness  
- Prioritizes nearest and most capable hospital  

---

### ⏱️ ETA-Based Decision Making
- Calculates **ETA (Estimated Time of Arrival)**  
- Ensures fastest possible treatment access  
- Uses distance + routing logic  

---

### ⚡ Real-Time Hospital Updates
- Live hospital resource tracking using **Socket.io**
- Dynamic updates of:
  - ICU beds  
  - Ventilators  
- Ensures accurate decision-making  

---

### 📊 Patient & Hospital Management
- Stores patient records  
- Updates hospital capacity after assignment  
- Maintains system consistency  

---

### 🌐 API-Based Architecture
- REST APIs for triage and hospital operations  
- Scalable backend design  

---

## 🧩 Tech Stack

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  

### Frontend
- React.js  

### AI Integration
- AI-based decision service (Grok / LLM APIs)

### Other Tools
- Socket.io  
- Axios  
- OSRM (Distance & ETA calculation)

---

## 🏗️ Project Structure

SpecForge/
│
├── backend/
│ ├── controllers/ # Business logic (triage, hospital, auth)
│ ├── data/ # Seed or static data
│ ├── middleware/ # Auth & custom middleware
│ ├── models/ # Mongoose schemas (Patient, Hospital, Admin)
│ ├── routes/ # API routes (triage, hospital, auth)
│ ├── services/ # External services (AI, maps, ML API)
│ ├── .env # Environment variables
│ ├── app.js # Express app config
│ ├── server.js # Entry point (server + socket setup)
│ ├── package.json
│ └── package-lock.json
│
├── frontend/
│ ├── node_modules/
│ ├── public/ # Static files
│ ├── src/ # React source code (components, pages)
│ ├── .gitignore
│ ├── package.json
│ └── package-lock.json
│
├── .gitignore
├── README.md