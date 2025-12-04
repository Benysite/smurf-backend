const express = require("express");
const router = express.Router();
const PlayerStat = require("../models/PlayerStat");

//
// 1) Ajouter une stat
//
router.post("/add", async (req, res) => {
  try {
    const stat = await PlayerStat.create(req.body);
    res.json({ success: true, stat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//
// 2) Obtenir toutes les stats
//
router.get("/", async (req, res) => {
  try {
    const stats = await PlayerStat.find();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//
// 3) Obtenir les stats d’un joueur
//
router.get("/:playerName", async (req, res) => {
  try {
    const stats = await PlayerStat.find({ playerName: req.params.playerName });
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//
// 4) Vérification Anti-Smurf
//
router.get("/:playerName/smurf-check", async (req, res) => {
  try {
    const playerName = req.params.playerName;

    const stats = await PlayerStat.find({ playerName });

    if (stats.length === 0) {
      return res.json({ success: true, message: "Aucune donnée trouvée" });
    }

    const avgKills = stats.reduce((a, b) => a + b.kills, 0) / stats.length;
    const avgDeaths = stats.reduce((a, b) => a + b.deaths, 0) / stats.length;
    const avgScore = stats.reduce((a, b) => a + b.score, 0) / stats.length;

    const kd = avgDeaths === 0 ? avgKills : avgKills / avgDeaths;

    const suspicionScore =
      (kd > 5 ? 30 : 0) +
      (kd > 10 ? 30 : 0) +
      (avgScore > 800 ? 20 : 0) +
      (avgKills > 40 ? 20 : 0);

    let verdict = "normal";
    if (suspicionScore >= 80) verdict = "highly_smurf";
    else if (suspicionScore >= 50) verdict = "likely_smurf";

    const reasons = [];
    if (kd > 5) reasons.push("KD anormalement élevé");
    if (kd > 10) reasons.push("KD extrêmement élevé");
    if (avgScore > 800) reasons.push("Score moyen très élevé");
    if (avgKills > 40) reasons.push("Kills moyens élevés");

    res.json({
      success: true,
      player: playerName,
      statsCount: stats.length,
      averages: { avgKills, avgDeaths, avgScore, kd },
      suspicionScore,
      verdict,
      reasons,
      history: stats
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//
// 5) Leaderboard global
//
router.get("/leaderboard/global", async (req, res) => {
  try {
    const players = await PlayerStat.distinct("playerName");
    const results = [];

    for (const player of players) {
      const stats = await PlayerStat.find({ playerName: player });

      if (!stats.length) continue;

      const avgKills = stats.reduce((a, b) => a + b.kills, 0) / stats.length;
      const avgDeaths = stats.reduce((a, b) => a + b.deaths, 0) / stats.length;
      const avgScore = stats.reduce((a, b) => a + b.score, 0) / stats.length;

      const kd = avgDeaths === 0 ? avgKills : avgKills / avgDeaths;

      let suspicion = 0;
      if (kd > 3) suspicion += 40;
      if (kd > 5) suspicion += 20;
      if (avgScore > 800) suspicion += 20;

      let verdict = "clean";
      if (suspicion >= 30) verdict = "maybe_smurf";
      if (suspicion >= 50) verdict = "likely_smurf";

      results.push({
        player,
        kd: Number(kd.toFixed(2)),
        avgScore: Math.round(avgScore),
        suspicion,
        verdict
      });
    }

    results.sort((a, b) => b.suspicion - a.suspicion);

    res.json({ success: true, leaderboard: results });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//
// 6) Leaderboard smurf score
//
router.get("/leaderboard/smurf", async (req, res) => {
  try {
    const byPlayer = await PlayerStat.aggregate([
      {
        $group: {
          _id: "$playerName",
          avgKills: { $avg: "$kills" },
          avgDeaths: { $avg: "$deaths" },
          avgScore: { $avg: "$score" },
          games: { $sum: 1 }
        }
      }
    ]);

    const ranked = byPlayer.map(p => {
      const kd = p.avgDeaths === 0 ? p.avgKills : p.avgKills / p.avgDeaths;

      let suspicion = 0;
      if (kd > 3) suspicion += 30;
      if (kd > 5) suspicion += 20;
      if (p.avgScore > 800) suspicion += 20;
      if (p.avgKills > 40) suspicion += 20;

      let verdict = "clean";
      if (suspicion >= 70) verdict = "likely_smurf";
      else if (suspicion >= 40) verdict = "suspect";

      return {
        player: p._id,
        games: p.games,
        kd: +kd.toFixed(2),
        avgKills: +p.avgKills.toFixed(1),
        avgDeaths: +p.avgDeaths.toFixed(1),
        avgScore: +p.avgScore.toFixed(0),
        suspicionScore: suspicion,
        verdict
      };
    }).sort((a, b) => b.suspicionScore - a.suspicionScore);

    res.json({ success: true, players: ranked });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//
// 7) Liste des joueurs
//
router.get("/players/list", async (req, res) => {
  try {
    const names = await PlayerStat.distinct("playerName");
    res.json({
      success: true,
      players: names.filter(Boolean).sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
// -----------------------------------
// LEADERBOARD : KD / Score / Kills
// -----------------------------------
router.get("/leaderboard/all", async (req, res) => {
  try {
    const players = await PlayerStat.aggregate([
      {
        $group: {
          _id: "$playerName",
          avgKills: { $avg: "$kills" },
          avgDeaths: { $avg: "$deaths" },
          avgScore: { $avg: "$score" },
          games: { $sum: 1 }
        }
      }
    ]);

    const leaderboard = players.map(p => ({
      player: p._id,
      kd: p.avgDeaths === 0 ? p.avgKills : (p.avgKills / p.avgDeaths),
      avgKills: p.avgKills,
      avgScore: p.avgScore,
      games: p.games
    }));

    res.json({
      success: true,
      kd: [...leaderboard].sort((a, b) => b.kd - a.kd),
      kills: [...leaderboard].sort((a, b) => b.avgKills - a.avgKills),
      score: [...leaderboard].sort((a, b) => b.avgScore - a.avgScore)
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

