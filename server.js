require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ---- CORS propre ----
app.use(cors({
  origin: [
    "https://benysite.github.io",
    "https://benysite.github.io/smurf-frontend",
    "http://localhost:3001",
    "http://localhost:5500"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ---- Fix Mongo warnings Render ----
mongoose.set("strictQuery", false);

// ---- Check MONGO_URI ----
if (!process.env.MONGO_URI) {
  console.error("❌ ERREUR : variable MONGO_URI manquante !");
  process.exit(1);
}

// ---- Connexion MongoDB ----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté ✔️"))
  .catch((err) => {
    console.error("Erreur MongoDB ❌", err);
    process.exit(1);
  });

// ---- ROUTES ----
const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

const riotRoutes = require("./routes/riot");
app.use("/api/riot", riotRoutes);

const analyzeRoutes = require("./routes/analyze");
app.use("/api/riot", analyzeRoutes);

// ---- Route test ----
app.get("/", (req, res) => {
  res.send("Backend OK 🚀");
});

// ---- Render impose PORT ----
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
