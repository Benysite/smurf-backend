const express = require("express");
const axios = require("axios");
const router = express.Router();

// Axios configuré pour Riot
const riot = axios.create({
    baseURL: "https://eu.api.riotgames.com",
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
});

// ============================
// 1️⃣ IDENTITÉ : Riot ID → PUUID
// ============================
router.get("/player/:gameName/:tagLine", async (req, res) => {
    const { gameName, tagLine } = req.params;

    try {
        const result = await riot.get(
            `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`
        );

        res.json({ success: true, player: result.data });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

// ============================
// 2️⃣ RANK DU JOUEUR (Valo)
// ============================
router.get("/rank/:puuid", async (req, res) => {
    const { puuid } = req.params;

    try {
        const response = await riot.get(
            `/val/ranked/v1/players/${puuid}`
        );

        res.json({ success: true, rank: response.data });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

// ============================
// 3️⃣ MATCHLIST (liste des matchs)
// ============================
router.get("/matches/:puuid", async (req, res) => {
    const { puuid } = req.params;

    try {
        const response = await riot.get(
            `/val/match/v1/matchlists/by-puuid/${puuid}`
        );

        res.json({ success: true, matches: response.data });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

// ============================
// 4️⃣ MATCH COMPLET (détails)
// ============================
router.get("/match/:matchId", async (req, res) => {
    const { matchId } = req.params;

    try {
        const response = await riot.get(
            `/val/match/v1/matches/${matchId}`
        );

        res.json({ success: true, match: response.data });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

// ============================
// 5️⃣ LEVEL DU JOUEUR (VALORANT)
// ============================
router.get("/level/:puuid", async (req, res) => {
    const { puuid } = req.params;

    try {
        const response = await riot.get(
            `/val/account-xp/v1/players/${puuid}`
        );

        res.json({ success: true, level: response.data });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message
        });
    }
});

// ============================
// EXPORT FINAL UNIQUE
// ============================
module.exports = router;
