import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Correct path to the public directory for static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// POST route to generate the social credit card
app.post("/generate-forcecard", async (req, res) => {
  const { handle } = req.body;
  let loyaltyLevel = "High";
  let socialCredit = 1000;
  let surveillanceStatus = "Full Compliance";

  // Placeholder logic for loyalty level and social credit score
  if (handle === "low_quality_user") {
    loyaltyLevel = "Low";
    socialCredit = 500;
    surveillanceStatus = "Under Review";
  }

  const cardId = `FMU-${Date.now().toString().slice(-6)}`;

  res.json({
    card_name: `Comrade ${handle}`,
    handle: handle,
    followers: 5000,
    following: 100,
    loyaltyLevel: loyaltyLevel,
    socialCredit: socialCredit,
    surveillanceStatus: surveillanceStatus,
    avatar: `https://unavatar.io/twitter/${handle}`,
    banner: `https://unavatar.io/twitter/${handle}?banner`,
    card_id: cardId
  });
});

// Set the server to listen on the appropriate port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
