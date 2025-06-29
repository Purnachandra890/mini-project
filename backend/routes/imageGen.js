const express = require("express");
const Replicate = require("replicate");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { writeFile } = require("fs/promises");
const userAuth = require("../middlewares/authMiddlewares");
const { User } = require("../models/schema");
const { ImageGen } = require("../models/schema");
const cloudinary = require("../utils/cloudinary");
const router = express.Router();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const IMAGE_AGENT_ID = "68335c84c1f73632413d5b40"; // 👈 Create one in your DB

router.post("/:userId", userAuth, async (req, res) => {
  //   console.log("reqiest from frontend.");
  const { prompt } = req.body;
  const userId = req.params.userId;

  //   console.log(prompt.trim());
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.tokens < 20) {
      return res
        .status(403)
        .json({ error: "Insufficient tokens or user not found." });
    }

    // console.log("user finded..")
    const input = {
      prompt: prompt.trim(),
      aspect_ratio: "16:9",
      output_format: "jpg",
      safety_filter_level: "block_medium_and_above",
    };
    const output = await replicate.run("google/imagen-4", { input });

    console.log("Generated image URL:", output); // If output is a URL

    // Download and save image
    const imageResponse = await fetch(output);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    await writeFile("my-image.jpg", imageBuffer);
    console.log("Image saved as my-image.jpg");


    // Upload to Cloudinary
    const cloudResult = await cloudinary.uploader.upload("my-image.jpg", {
      folder: "genie-ai/images",
      format: "webp",
    });

    // Save to DB
    const imageDoc = await ImageGen.create({
      userId,
      agentId: IMAGE_AGENT_ID,
      prompt,
      imageUrl: cloudResult.secure_url,
    });

    // Deduct tokens
    user.tokens -= 20;
    await user.save();

    res.json({
      message: "Image generated successfully.",
      imageUrl: cloudResult.secure_url,
      tokensLeft: user.tokens,
      imageId: imageDoc._id,
    });
  } catch (err) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: "Image generation failed." });
  }
});

router.delete("/history/:userId", userAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    await ImageGen.deleteMany({ userId });
    res.json({ message: "Image history cleared." });
  } catch (err) {
    console.error("Error deleting image history:", err);
    res.status(500).json({ error: "Failed to delete image history." });
  }
});

router.get("/history/:userId", userAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const images = await ImageGen.find({ userId }).sort({ timestamp: 1 });
    res.json(images);
  } catch (err) {
    console.error("❌ Error fetching image history:", err);
    res.status(500).json({ error: "Failed to load image history." });
  }
});

module.exports = router;
