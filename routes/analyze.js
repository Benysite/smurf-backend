const express = require("express");
const axios = require("axios");
const { calculateSmurfScore } = require("../utils/smurfScore");
const router = express.Router();

// Riot ID → DOIT aller sur AMERICAS
const riotAccount = axios.create({
    baseURL: "https://americas.api.riotgames.com",
    params: { api_key: process.env.RIOT_API_KEY }
});

// Matchs, Rank, XP → région EU pour toi
const riotVal = axios.create({
    baseURL: "https://eu.api.riotgames.com",
    params: { api_key: process.env.RIOT_API_KEY }
});

router.get("/analyze/:gameName/:tagLine", async (req, res) => {
    const { gameName, tagLine } = req.params;

    try {
        // 1️⃣ Get PUUID (AMERICAS)
        const acc = await riotAccount.get(
            `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`
        );
        const puuid = acc.data.puuid;

        // 2️⃣ Get Level (EU)
        let level = null;
        try {
            const lev = await riotVal.get(`/val/account-xp/v1/players/${puuid}`);
            level = lev.data.Progress.CurrentLevel;
        } catch (_) {}

        // 3️⃣ Match history (EU)
        let matches = [];
        try {
            const list = await riotVal.get(`/val/match/v1/matchlists/by-puuid/${puuid}`);
            matches = list.data.history || [];
        } catch (_) {}

        // 4️⃣ Rank (EU)
        let rank = null;
        let rankSource = "real";
        try {
            const r = await riotVal.get(`/val/ranked/v1/players/${puuid}`);
            rank = r.data;
        } catch (err) {
            if (err.response?.status === 403) {
                rank = null;
                rankSource = "dev-key";
            }
        }

        // 5️⃣ Score
        const smurfScore = calculateSmurfScore({
            level: level || 0,
            accountAgeDays: 5,
            kd: 1.5,
            winrate: 60,
            acs: 200,
            matchesPlayed: matches.length,
            hsRate: 20,
            rank
        });

        res.json({
            success: true,
            player: acc.data,
            puuid,
            level,
            matchCount: matches.length,
            rank,
            rankSource,
            smurfScore
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

module.exports = router;
