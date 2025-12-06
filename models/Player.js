const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    puuid: { type: String, unique: true },
    gameName: String,
    tagLine: String,
    shard: String,
    lastSeen: Date
});

module.exports = mongoose.model("Player", playerSchema);
