const express = require('express');
const { Agent,User,Chat,Session } = require('../models/schema');
const Groq =require('groq-sdk')
const router = express.Router();
const userAuth =require('../middlewares/authMiddlewares')
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const promptHistory = new Map();
const AGENT_ID="68335c84c1f73632413c5b40"


router.post("/content/:userId", userAuth, async (req, res) => {
    const { prompt } = req.body;
    const userId = req.params.userId;
  
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required and must be a non-empty string." });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found." });
  
      if (user.tokens < 5) {
        return res.status(403).json({ error: "Insufficient tokens. Please recharge." });
      }
  
      const normalizedPrompt = prompt.trim().toLowerCase();
      const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
      const isGreetingOnly = greetings.includes(normalizedPrompt);
  
      if (isGreetingOnly) {
        const greetingResponse =
          "👋 Hello! I'm LinguaAI — your personal language translator. Paste any non-English text, and I’ll translate it to English for you.";
        await Chat.create({ userId, agentId: TRANSLATION_AGENT_ID, prompt, response: greetingResponse, tokensUsed: 0 });
        return res.json({ response: greetingResponse, tokensLeft: user.tokens });
      }
  
      // Call Groq model to translate text to English
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are a professional translator. Translate any input text to fluent English. Respond with only the translated version." },
          { role: "user", content: prompt },
        ],
        model: "llama3-70b-8192",
        temperature: 0.3,
        max_completion_tokens: 512,
        top_p: 1,
        stream: true,
      });
  
      let translatedText = "";
      try {
        for await (const chunk of stream) {
          translatedText += chunk.choices[0]?.delta?.content || "";
        }
      } catch (streamErr) {
        console.error("Error reading translation stream:", streamErr);
        return res.status(500).json({ error: "Translation stream failed." });
      }
  
      // DB transaction - Deduct 5 tokens
      const session = await User.startSession();
      session.startTransaction();
  
      try {
        const freshUser = await User.findById(userId).session(session);
        if (!freshUser || freshUser.tokens < 5) {
          await session.abortTransaction();
          session.endSession();
          return res.status(403).json({ error: "Insufficient tokens during transaction." });
        }
  
        freshUser.tokens -= 5;
        await freshUser.save({ session });
  
        const tokensUsed = Math.ceil(translatedText.split(" ").length / 2);
        await Chat.create(
          [
            {
              userId,
              agentId: AGENT_ID,
              prompt,
              response: translatedText,
              tokensUsed,
            },
          ],
          { session }
        );
  
        await session.commitTransaction();
        session.endSession();
        user.tokens = freshUser.tokens;
      } catch (dbErr) {
        await session.abortTransaction();
        session.endSession();
        console.error("Transaction failed:", dbErr);
        return res.status(500).json({ error: "Could not save translation." });
      }
  
      return res.json({ response: translatedText, tokensLeft: user.tokens });
    } catch (err) {
      console.error("❌ Translation agent error:", err);
      return res.status(500).json({ error: "Something went wrong." });
    }
  });
  



router.get("/content/:userId", userAuth, async (req, res) => {
    try {
    const userId= req.params.userId;      // from your auth middleware
      const chats = await Chat.find({ 
        agentId: AGENT_ID, 
        userId 
      }).sort({ timestamp: 1 });
      res.json(chats);
    } catch (err) {
      res.status(500).json({ error: "Unable to retrieve chats" });
    }
  });
  
router.delete("/content/:userId", userAuth, async (req, res) => {
  const userId = req.params.userId;
  const { title } = req.body;     // e.g. { "title": "Session 1: GST Scripts" }

  try {
    // 1) Fetch all chats for this user & agent
    const chats = await Chat.find({ userId, agentId: AGENT_ID }).sort({ timestamp: 1 });

    if (!chats.length) {
      return res.status(404).json({ message: "No chats to archive/delete." });
    }
    const defaultTitle = `Session on ${new Date().toLocaleString()}`;
    // 2) Create a session snapshot
    const session = await Session.create({
      userId,
      agentId: AGENT_ID,
      title: title || `Session on ${new Date().toLocaleString()}`,
      // createdAt and updatedAt default will be set automatically
    });

    // Optionally, you can embed the chat IDs or data in the session if you like:
    // session.chatIds = chats.map(c => c._id);
    // await session.save();

    // 3) Delete the chats
    await Chat.deleteMany({ userId, agentId: AGENT_ID });

    // 4) Respond with the session info
    return res.json({
      message: "Chats archived and deleted successfully.",
      sessionId: session._id,
      title: session.title,
    });

  } catch (err) {
    console.error("❌ Error archiving & deleting chats:", err);
    return res.status(500).json({ error: "Failed to archive/delete chats." });
  }
});



  module.exports = router;