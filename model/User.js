const mongoose = require("mongoose");

// Define the Preferences schema
const preferencesSchema = new mongoose.Schema({
  age: { type: [Number], default: [] },
  distance: { type: Number, default: 0 },
  ethnicity: { type: [String], default: [] },
  relationship_goals: { type: [String], default: [] },
  smoking: { type: String, default: "" },
  drinking: { type: String, default: "" },
});

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    gender: { type: String },
    bio: { type: String },
    dob: { type: Date },
    status: { type: String, default: "pending" },
    my_interests: { type: [String], default: [] },
    interested_gender: { type: String },
    preferences: { type: preferencesSchema, default: {} },
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
