const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
require("dotenv").config();
const userAuth = require("../middlewares/authMiddlewares");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", userAuth, async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a grammar corrector. Rewrite the user's text with proper grammar and clarity. Return only the corrected sentence — no explanation, no alternatives.",
        },

        {
          role: "user",
          content: `Rewrite this with better grammar and clarity:\n"${text}"`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 128,
    });

    const rewrittenText = response.choices[0].message.content.trim();
    res.json({ rewrittenText });
  } catch (err) {
    console.error("Rewrite error:", err);
    res.status(500).json({ error: "Rewrite failed" });
  }
});

module.exports = router;
