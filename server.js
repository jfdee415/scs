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
  let sentiment = "Positive"; // Initial sentiment based on tweets
  let contentCompliance = 10; // Base content compliance score
  let tagline = "";

  try {
    const profileRes = await fetch(
      `https://api.twitterapi.io/twitter/user/info?userName=${handle}`,
      { headers: { "X-API-Key": process.env.TWITTERAPI_KEY } }
    );
    const profileData = await profileRes.json();
    
    const followers = profileData.data.followers || 0;
    const following = profileData.data.following || 0;
    const tweets = profileData.data.tweets || [];

    // Sentiment Analysis (mocking here, replace with actual sentiment analysis logic)
    sentiment = tweets.some(tweet => tweet.text.includes("love") || tweet.text.includes("patriot")) ? "Positive" : "Negative";

    // Content compliance: If too many tweets are critical or unapproved
    contentCompliance = tweets.filter(tweet => !tweet.text.includes("approved-topic")).length < 5 ? 10 : 2;

    // Social credit calculation logic
    socialCredit = Math.min(1500, Math.round(1000 + 500 * Math.random())); // Random factor for humor

    // Loyalty and surveillance logic
    if (handle === "counter_revolutionary") {
      loyaltyLevel = "Needs Re-education";
      socialCredit -= 500;
      surveillanceStatus = "Re-education Required";
      tagline = "Revolutionary, but in the wrong direction.";
    } else if (followers > 5000) {
      loyaltyLevel = "Loyal Comrade";
      socialCredit += 200;
      surveillanceStatus = "Full Compliance";
      tagline = "A model citizen. Full support to the party.";
    } else {
      loyaltyLevel = "Suspicious Citizen";
      tagline = "Doesn't comply with the greater good. Suspicious.";
    }

    // Add some humorously sarcastic taglines
    if (!tagline) {
      const randomTaglines = [
        "Certified government supporter. Enjoy your privileges.",
        "Comrade, your loyalty is appreciated... mostly.",
        "Approaching optimal loyalty level. Further surveillance pending.",
        "Low-key rebel detected. Proceed with caution.",
        "Your account has been flagged for overactivity. Proceed with caution."
      ];
      tagline = randomTaglines[Math.floor(Math.random() * randomTaglines.length)];
    }

    // Generate the response based on social credit
    const cardId = `FMU-${Date.now().toString().slice(-6)}`;

    res.json({
      card_name: `Comrade ${handle}`,
      handle: handle,
      followers: followers,
      following: following,
      loyaltyLevel: loyaltyLevel,
      socialCredit: socialCredit,
      surveillanceStatus: surveillanceStatus,
      sentiment: sentiment,
      contentCompliance: contentCompliance,
      avatar: `https://unavatar.io/twitter/${handle}`,
      banner: `https://unavatar.io/twitter/${handle}?banner`,
      tagline: tagline,
      card_id: cardId
    });

  } catch (err) {
    console.error("Error fetching Twitter data:", err);
    res.status(500).json({ error: "Failed to fetch Twitter data." });
  }
});

// Set the server to listen on the appropriate port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
