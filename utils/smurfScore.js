// utils/smurfScore.js

/**
 * Calcule un score de smurf entre 0 et 100
 * en utilisant plusieurs critères statistiques
 */

function calculateSmurfScore(stats) {
    // stats = {
    //   level, accountAgeDays, kd, winrate, acs, matchesPlayed, hsRate, rank
    // }

    let score = 0;

    // 🟦 1. Level bas → suspect
    if (stats.level <= 20) score += 25;
    else if (stats.level <= 40) score += 10;

    // 🟨 2. Ancienneté faible
    if (stats.accountAgeDays <= 14) score += 20;
    else if (stats.accountAgeDays <= 30) score += 10;

    // 🟥 3. KD trop élevé pour un nouveau compte
    if (stats.kd >= 1.7) score += 20;
    else if (stats.kd >= 1.4) score += 10;

    // 🟩 4. Winrate élevé
    if (stats.winrate >= 65) score += 15;
    else if (stats.winrate >= 55) score += 5;

    // 🟪 5. ACS élevé
    if (stats.acs >= 250) score += 10;

    // 🟫 6. Nombre de matchs trop faible
    if (stats.matchesPlayed <= 30) score += 10;

    // 🟦 7. Headshot % élevé
    if (stats.hsRate >= 25) score += 10;
    else if (stats.hsRate >= 20) score += 5;

    // Finalisation
    if (score > 100) score = 100;

    return score;
}

module.exports = { calculateSmurfScore };
