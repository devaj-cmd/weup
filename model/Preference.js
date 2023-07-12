const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // No longer required
    },
    age: {
      min: {
        type: Number,
        // No longer required
      },
      max: {
        type: Number,
        // No longer required
      },
    },
    distance: {
      type: Number,
      // No longer required
    },
    drinking: {
      type: String,
      // No longer required
    },
    education: {
      type: String,
      // No longer required
    },
    ethnicity: {
      type: String,
      // No longer required
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      // No longer required
    },
    height: {
      type: Number,
      // No longer required
    },
    kids: {
      type: String,
      // No longer required
    },
    relationship_goals: {
      type: String,
      // No longer required
    },
    religion: {
      type: String,
      // No longer required
    },
    smoking: {
      type: String,
      // No longer required
    },
  },
  {
    timestamps: true,
  }
);

const Preference = mongoose.model("Preference", preferenceSchema);

module.exports = Preference;
