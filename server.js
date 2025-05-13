import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Define the loyalty level based on social credit score
function getLoyaltyTier(socialCredit) {
  if (socialCredit >= 1300) return "Top Comrade";
  else if (socialCredit >= 1000) return "Loyal Comrade";
  else if (socialCredit >= 700) return "Revolutionary";
  return "Counter-Revolutionary";
}

// POST route to generate the CCP social credit card
app.post("/generate-ccp-card", async (req, res) => {
  const { handle } = req.body;
  let userId = null;
  let followers = 0;
  let following = 0;
  let avatarUrl = `https://unavatar.io/twitter/${handle}`;
  let displayHandle = handle;
  let isBlueVerified = false;
  let tweets = [];
  let socialCredit = 1000;
  let loyaltyLevel = "Top Comrade";
  let bannerUrl = "";

  try {
    console.log(`🔎 Fetching Twitter profile for @${handle}...`);
    const profileRes = await fetch(
      `https://api.twitterapi.io/twitter/user/info?userName=${handle}`,
      { headers: { "X-API-Key": process.env.TWITTERAPI_KEY } }
    );

    const profileData = await profileRes.json();
    userId = profileData?.data?.id;
    followers = profileData?.data?.followers ?? 0;
    following = profileData?.data?.following ?? 0;
    displayHandle = profileData?.data?.userName ?? handle;
    isBlueVerified = profileData?.data?.isBlueVerified || false;
    avatarUrl = profileData?.data?.profilePicture?.replace("_normal", "") || avatarUrl;
    bannerUrl = profileData?.data?.coverPicture || "";

  } catch (err) {
    console.warn("⚠️ Twitter profile fetch failed:", err.message);
    followers = Math.floor(Math.random() * 10000) + 100;
  }

  const basePower = Math.round(10 + 140 * Math.pow(Math.min(followers, 150000) / 150000, 0.65));
  const bonus = (isBlueVerified ? 5 : 0) + (followers > 0 ? Math.floor((following / followers) * 5) : 0);
  socialCredit = Math.min(1500, basePower + bonus);

  loyaltyLevel = getLoyaltyTier(socialCredit); // Assign loyalty level based on social credit

  // Generate random tweets if none available
  if (tweets.length === 0) {
    tweets = ["Working for the Party", "Serve the state", "Glory to the Communist Party"];
  }

  // Generate response card
  const cardId = `CCP-${Date.now().toString().slice(-6)}`;

  const responseCard = {
    card_name: `Comrade ${handle}`,
    handle: handle,
    followers: followers,
    following: following,
    loyaltyLevel: loyaltyLevel,
    socialCredit: socialCredit,
    avatar: avatarUrl,
    banner: bannerUrl,
    card_id: cardId,
    tagline: loyaltyLevel === "Counter-Revolutionary" ? "Must undergo re-education." : "True Comrade of the People",
  };

  console.log("Generated Card Data:", responseCard);
  res.json(responseCard);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
