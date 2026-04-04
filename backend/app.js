const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/hospitals", require("./routes/hospital.routes"));
app.use("/api/auth",      require("./routes/auth.routes"));
app.use("/api",           require("./routes/triage.routes")); // ← changed

// Health check
app.get("/", (req, res) => {
  res.json({ message: "HC03 Emergency Triage API Running ✅" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

module.exports = app;