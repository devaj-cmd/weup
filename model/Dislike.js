const mongoose = require("mongoose");

const dislikeSchema = new mongoose.Schema({
  loggedInUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dislikedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Dislike = mongoose.model("Dislike", dislikeSchema);

module.exports = Dislike;
