const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
    },

    icu: {
      type: Number,
      default: 0,
    },

    ventilator: {
      type: Number,
      default: 0,
    },

    specialists: [
      {
        type: String,
      },
    ],

    emergencyAvailable: {
      type: Boolean,
      default: true,
    },

    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);