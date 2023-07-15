const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    gender: { type: String },
    bio: { type: String },
    dob: { type: Date },
    phoneNumber: { type: String },
    status: { type: String, default: "pending" },
    my_interests: { type: [String], default: [] },
    interested_gender: { type: String },
    preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
    reports: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Report", default: [] },
    ],
    blockedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],
  },
  { timestamps: true }
);

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = { User };
