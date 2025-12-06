const express = require("express");
const axios = require("axios");
const router = express.Router();

// Axios configuré pour Riot
const riot = axios.create({
    baseURL: "https://europe.api.riotgames.com",
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY }
});

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

// (et tout le reste… rank, matches, match…)

module.exports = router;
