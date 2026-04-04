const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getMe,
  verifyAdmin,
  getAllAdmins,
} = require("../controllers/auth.controller");
const { protect, superAdminOnly } = require("../middleware/auth.middleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", protect, getMe);

// Super admin only routes
router.get("/admins", protect, superAdminOnly, getAllAdmins);
router.put("/verify/:id", protect, superAdminOnly, verifyAdmin);

module.exports = router;