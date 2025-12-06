const express = require("express");
const axios = require("axios");
const { calculateSmurfScore } = require("../utils/smurfScore");
const router = express.Router();

const riot = axios.create({
    baseURL: "https://eu.api.riotgames.com",
    params: {
        api_key: process.env.RIOT_API_KEY
    }
});

// ========================
// ROUTE PRINCIPALE : analyse complète
// ========================
router.get("/analyze/:gameName/:tagLine", async (req, res) => {
    const { gameName, tagLine } = req.params;

    try {
        // 1️⃣ Récupération du compte (PUUID)
        const acc = await riot.get(
            `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`
        );
        const puuid = acc.data.puuid;

        // 2️⃣ Level
        let level = null;
        try {
            const lev = await riot.get(`/val/account-xp/v1/players/${puuid}`);
            level = lev.data.Progress.CurrentLevel;
        } catch (err) {
            level = null; // DEV KEY = pas de level possible
        }

        // 3️⃣ Matchlist
        let matches = [];
        try {
            const list = await riot.get(`/val/match/v1/matchlists/by-puuid/${puuid}`);
            matches = list.data.history || [];
        } catch (err) {
            matches = [];
        }

        // 4️⃣ Rank
        let rank = null;
        let rankSource = "riot";
        try {
            const r = await riot.get(`/val/ranked/v1/players/${puuid}`);
            rank = r.data;
        } catch (err) {
            if (err.response?.status === 403) {
                rank = null;
                rankSource = "no-production-key";
            }
        }

        // 5️⃣ Données minimales pour calculer le score
        const smurfScore = calculateSmurfScore({
            level: level || 0,
            accountAgeDays: 5, 
            kd: 1.5,
            winrate: 60,
            acs: 200,
            matchesPlayed: matches.length,
            hsRate: 20,
            rank: rank
        });

        // 6️⃣ Réponse finale
        return res.json({
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
        return res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

module.exports = router;
