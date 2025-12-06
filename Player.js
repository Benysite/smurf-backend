const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    puuid: { type: String, unique: true, required: true },
    gameName: String,
    tagLine: String,
    shard: String,
    lastSeen: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Player", PlayerSchema);
