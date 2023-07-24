const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  loggedInUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  favoriteUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
