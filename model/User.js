const mongoose = require("mongoose");

const Preference = require("./Preference");

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
    preferences: { type: mongoose.Schema.Types.ObjectId, ref: "Preference" },
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

userSchema.pre("save", async function (next) {
  // Create a new Preference document
  const preference = new Preference({
    age: [],
    distance: 0,
    ethnicity: [],
    relationship_goals: [],
    smoking: "",
    drinking: "",
    education: "",
    height: 0,
    kids: "",
    religion: "",
  });

  try {
    // Save the preference document
    const savedPreference = await preference.save();
    // Assign the preference ObjectId to the user's preferences field
    this.preferences = savedPreference._id;
    next();
  } catch (error) {
    next(error);
  }
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = { User };
