const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    age: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    interests: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Preference = mongoose.model("Preference", preferenceSchema);

module.exports = Preference;
