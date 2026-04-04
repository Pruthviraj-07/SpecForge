const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hospitalAffiliation: { type: String, required: true },
    hospitalCode: { type: String, required: true },
    role: {
      type: String,
      enum: ["hospital_admin", "govt_admin"],
      default: "hospital_admin",
    },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Drop any stale indexes (e.g. old govtId_1) on first connection
adminSchema.post("init", () => {});

module.exports = mongoose.model("Admin", adminSchema);