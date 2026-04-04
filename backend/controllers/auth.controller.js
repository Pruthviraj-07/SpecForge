const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");
const HospitalCode = require("../models/hospitalCode.model");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerAdmin = async (req, res) => {
  console.log("REGISTER BODY:", req.body);
  const { name, email, password, hospitalCode, hospitalAffiliation } = req.body;

  try {
    if (!name || !email || !password || !hospitalCode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const validCode = await HospitalCode.findOne({ code: hospitalCode });
    if (!validCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital code.",
      });
    }

    if (!validCode.isDummy && validCode.isUsed) {
      return res.status(400).json({
        success: false,
        message: "This hospital code is already registered by another admin.",
      });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const affiliation = validCode.isDummy
      ? hospitalAffiliation || "New Hospital"
      : validCode.hospitalName;

    const isVerified = true;

    const admin = await Admin.create({
      name,
      email,
      password,
      hospitalAffiliation: affiliation,
      hospitalCode,
      isVerified,
    });

    if (!validCode.isDummy) {
      await HospitalCode.findOneAndUpdate({ code: hospitalCode }, { isUsed: true });
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. You can now log in.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        hospitalAffiliation: admin.hospitalAffiliation,
        hospitalCode: admin.hospitalCode,
        isVerified: admin.isVerified,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.name, error.code, error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already registered`,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Block unverified (pending-approval) admins from logging in
    if (!admin.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval by the administrator. Please wait.",
      });
    }

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        hospitalAffiliation: admin.hospitalAffiliation,
        hospitalCode: admin.hospitalCode,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

const verifyAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, message: `${admin.name} verified successfully`, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerAdmin, loginAdmin, getMe, verifyAdmin, getAllAdmins };