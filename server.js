require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(cors({
  origin: [
    "https://benysite.github.io",
    "http://localhost:3001"
  ]
}));
app.use(express.json());

// Pour éviter les warnings / crash Render
mongoose.set("strictQuery", false);

// Vérification de la variable Mongo
if (!process.env.MONGO_URI) {
  console.error("❌ ERREUR : variable MONGO_URI manquante !");
  process.exit(1);  // Stoppe Render proprement
}

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté ✔️"))
  .catch((err) => {
    console.error("Erreur MongoDB ❌", err);
    process.exit(1);
  });

// Import des routes
const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("Backend OK 🚀");
});

// Render impose son propre PORT → obligatoire
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
