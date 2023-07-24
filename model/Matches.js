const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  loggedInUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
