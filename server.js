require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté ✔️"))
  .catch(err => console.error("Erreur MongoDB ❌", err));

// Import des routes
const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("Backend OK 🚀");
});

app.listen(3001, () => {
  console.log("Serveur lancé sur http://localhost:3001");
});
app.use("/stats", statsRoutes);