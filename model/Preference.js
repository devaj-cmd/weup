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
    distance: {
      type: Number,
      required: true,
    },
    drinking: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    ethnicity: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    kids: {
      type: String,
      required: true,
    },
    relationship_goals: {
      type: String,
      required: true,
    },
    religion: {
      type: String,
      required: true,
    },
    smoking: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Preference = mongoose.model("Preference", preferenceSchema);

module.exports = Preference;
