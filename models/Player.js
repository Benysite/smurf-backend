const mongoose = require("mongoose");

const PlayerStatSchema = new mongoose.Schema({
  playerName: { type: String, required: false },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PlayerStat", PlayerStatSchema);
