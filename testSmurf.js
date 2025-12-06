const { calculateSmurfScore } = require("./utils/smurfScore");

console.log(
    calculateSmurfScore({
        level: 15,
        accountAgeDays: 5,
        kd: 1.8,
        winrate: 70,
        acs: 260,
        matchesPlayed: 20,
        hsRate: 22,
        rank: null
    })
);
