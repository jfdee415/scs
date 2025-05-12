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

// Function to fetch and clean tweets (as provided)
const getTweets = async (userId, apiKey, count, includeMedia) => {
  const cleanedTweets = [];
  let nextCursor = null;

  while (cleanedTweets.length < count) {
    const url = new URL("https://api.twitterapi.io/twitter/user/last_tweets");
    url.searchParams.set("userId", userId);
    if (nextCursor) url.searchParams.set("cursor", nextCursor);

    const res = await fetch(url.toString(), {
      headers: { "X-API-Key": apiKey },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch tweets: ${res.status}`);
    }

    const json = await res.json();
    const tweets = json.data?.tweets ?? [];

    for (const tweet of tweets) {
      if (tweet.type !== "tweet" || !tweet.text) continue;

      cleanedTweets.push({
        text: tweet.text,
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        createdAt: tweet.createdAt,
      });

      if (cleanedTweets.length >= count) break;
    }

    if (!json.has_next_page || !json.next_cursor) break;
    nextCursor = json.next_cursor;
  }

  return cleanedTweets.slice(0, count);
};

// POST route to generate the social credit card
app.post("/generate-forcecard", async (req, res) => {
  const { handle } = req.body;

  let loyaltyLevel = "High";
  let socialCredit = 1000;
  let surveillanceStatus = "Full Compliance";
  let sentiment = "Positive";
  let tagline = "";

  try {
    const profileRes = await fetch(
      `https://api.twitterapi.io/twitter/user/info?userName=${handle}`,
      { headers: { "X-API-Key": process.env.TWITTERAPI_KEY } }
    );
    const profileData = await profileRes.json();

    const userId = profileData.data.userId;

    // Get tweets for sentiment analysis
    const tweets = await getTweets(userId, process.env.TWITTERAPI_KEY, 5, true);

    sentiment = tweets.some(tweet => tweet.text.includes("love") || tweet.text.includes("patriot")) ? "Positive" : "Negative";

    const followers = profileData.data.followers || 0;
    const following = profileData.data.following || 0;

    socialCredit = Math.min(1500, Math.round(1000 + 500 * Math.random()));

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

    const cardId = `FMU-${Date.now().toString().slice(-6)}`;

    const responseCard = {
      card_name: `Comrade ${handle}`,
      handle: handle,
      followers: followers,
      following: following,
      loyaltyLevel: loyaltyLevel,
      socialCredit: socialCredit,
      surveillanceStatus: surveillanceStatus,
      sentiment: sentiment,
      avatar: `https://unavatar.io/twitter/${handle}`,
      tagline: tagline,
      card_id: cardId
    };

    res.json(responseCard);

  } catch (err) {
    console.error("Error fetching Twitter data:", err);
    res.status(500).json({ error: "Failed to fetch Twitter data." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
