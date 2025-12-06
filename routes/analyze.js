const express = require("express");
const axios = require("axios");
const { calculateSmurfScore } = require("../utils/smurfScore");
const Player = require("../models/Player");
const router = express.Router();

// Riot ID → toujours AMERICAS
const riotAccount = axios.create({
    baseURL: "https://americas.api.riotgames.com",
    params: { api_key: process.env.RIOT_API_KEY }
});

// Shards autorisés
const ALLOWED_SHARDS = new Set(["na", "eu", "ap", "kr", "latam", "br"]);

router.get("/analyze/:gameName/:tagLine", async (req, res) => {
    const { gameName, tagLine } = req.params;
    const region = (req.query.region || "eu").toLowerCase();
    const shard = ALLOWED_SHARDS.has(region) ? region : "eu";

    // Valorant endpoints selon région
    const riotVal = axios.create({
        baseURL: `https://${shard}.api.riotgames.com`,
        params: { api_key: process.env.RIOT_API_KEY }
    });

    try {
        // 1) PUUID (AMERICAS)
        const acc = await riotAccount.get(
            `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`
        );
        const puuid = acc.data.puuid;

        // ➤ Enregistrer / mettre à jour le joueur dans Mongo
        await Player.findOneAndUpdate(
            { puuid },
            {
                puuid,
                gameName: acc.data.gameName,
                tagLine: acc.data.tagLine,
                shard,
                lastSeen: new Date()
            },
            { upsert: true, new: true }
        );

        // 2) LEVEL
        let level = null;
        try {
            const lev = await riotVal.get(`/val/account-xp/v1/players/${puuid}`);
            level = lev.data?.Progress?.CurrentLevel ?? lev.data?.Progress?.Level ?? null;
        } catch (_) {}

        // 3) MATCHLIST
        let matches = [];
        try {
            const list = await riotVal.get(`/val/match/v1/matchlists/by-puuid/${puuid}`);
            matches = list.data?.history || [];
        } catch (_) {}

        // 4) RANK
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

        // 5) SmurfScore (encore avec stats par défaut)
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
            shard,
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
