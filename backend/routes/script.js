const express = require("express");
const { Agent, User, Chat, Session } = require("../models/schema");
const Groq = require("groq-sdk");
const router = express.Router();
const userAuth = require("../middlewares/authMiddlewares");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const promptHistory = new Map();
const AGENT_ID = "6833325320509fe90ae47989";

router.post("/content/:userId", userAuth, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.params.userId;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Prompt is required and must be a non-empty string." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.tokens < 30) {
      return res
        .status(403)
        .json({ error: "Insufficient tokens. Please recharge." });
    }

    const normalizedPrompt = prompt.trim().toLowerCase();
    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
    const isGreetingOnly = greetings.includes(normalizedPrompt);

    if (isGreetingOnly) {
      const greetingResponse =
        "👋 Hi there! I'm GenieAI. I generate scripts for YouTube, Shorts, Reels, and Podcasts. What kind of script would you like?";
      await Chat.create({
        userId,
        agentId: AGENT_ID,
        prompt,
        response: greetingResponse,
        tokensUsed: 0,
      });
      return res.json({ response: greetingResponse, tokensLeft: user.tokens });
    }

    // Follow-up logic
    const followUps = [
      "expand it",
      "make it bigger",
      "increase size",
      "add more content",
      "add more examples",
      "make it long",
      "continue it",
      "add details",
      "elaborate",
    ];
    const isFollowUp = followUps.some((fu) => normalizedPrompt.includes(fu));
    let finalPrompt = prompt;
    if (isFollowUp && promptHistory.has(userId)) {
      const prev = promptHistory.get(userId);
      finalPrompt = `Please expand and continue the following script request with more details and depth:\n\n"${prev}"`;
    }

    // Intent Classification
    let intent = "no";
    const scriptKeywords = [
      "script",
      "podcast",
      "youtube",
      "short",
      "reel",
      "dialogue",
      "conversation",
    ];
    const containsScriptKeyword = scriptKeywords.some((kw) =>
      normalizedPrompt.includes(kw)
    );

    try {
      const cls = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a script request detector. Reply only with 'yes' if the user prompt is a request to generate a script (like for YouTube, podcast, reels, shorts, or content creation). Otherwise reply 'no'.",
          },
          { role: "user", content: finalPrompt },
        ],
        model: "llama3-8b-8192",
        temperature: 0,
        max_tokens: 1,
      });

      intent = cls.choices[0].message.content.trim().toLowerCase();
      console.log(
        `🧠 Intent classifier said: "${intent}" for prompt: ${finalPrompt}`
      );
    } catch (clsErr) {
      console.error("Classifier failed, falling back to keyword check.");
    }

    if (intent !== "yes" && !containsScriptKeyword) {
      const lastChats = await Chat.find({ userId, agentId: AGENT_ID })
        .sort({ timestamp: -1 })
        .limit(3);

      if (lastChats.length) {
        const fallbackResponses = lastChats
          .map((c) => `📝 Prompt: ${c.prompt}\n🎬 ${c.response}`)
          .join("\n\n---\n\n");
        const fallbackMessage = `⚠️ I only generate scripts...\n\nHere are your last 3:\n\n${fallbackResponses}`;
        await Chat.create({
          userId,
          agentId: AGENT_ID,
          prompt,
          response: fallbackMessage,
          tokensUsed: 0,
        });
        return res.json({ response: fallbackMessage, tokensLeft: user.tokens });
      }

      const noHistoryMessage =
        "⚠️ I only generate scripts... You haven't generated any yet.";
      await Chat.create({
        userId,
        agentId: AGENT_ID,
        prompt,
        response: noHistoryMessage,
        tokensUsed: 0,
      });
      return res
        .status(400)
        .json({ response: noHistoryMessage, tokensLeft: user.tokens });
    }

    // Generate script via streaming
    const stream = await groq.chat.completions.create({
      messages: [
        {
  role: "system",
  content: `You are a professional content writer who creates high-quality scripts for different platforms like YouTube, Reels, Shorts, Podcasts, and Movies.

Your job:
1. Understand the user's intent and content style based on their prompt.
2. Format the script accordingly:

- 🎬 **Movie/Drama**: Use screenplay format (scene headings, character dialogues, etc.).
- 📽️ **YouTube Tutorial**: Use timestamps or step-by-step narration.
- 🎙️ **Podcast**: Use speaker labels and a conversational tone.
- 🎞️ **Shorts/Reels**: Keep it short, punchy, and engaging within 30-60 seconds.
- 📢 **Motivational/Monologue**: Use strong tone, pauses, and impact.

Ensure proper structure, formatting, and clarity. Always break content into paragraphs or bullet-like lines for readability.

End with a clear closing (e.g., “Thanks for watching”, “That’s a wrap”, or “The End”) if applicable.`,
},

        { role: "user", content: finalPrompt },
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
    });

    let fullResponse = "";
    try {
      for await (const chunk of stream) {
        fullResponse += chunk.choices[0]?.delta?.content || "";
      }
    } catch (streamError) {
      console.error("Error reading streaming response:", streamError);
      return res
        .status(500)
        .json({ error: "Failed to read streaming response." });
    }

    // Deduct tokens and save chat (transaction)
    const session = await User.startSession();
    session.startTransaction();

    try {
      const freshUser = await User.findById(userId).session(session);
      if (!freshUser) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ error: "User not found during transaction." });
      }
      if (freshUser.tokens < 30) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(403)
          .json({ error: "Insufficient tokens during processing." });
      }

      freshUser.tokens -= 30;
      await freshUser.save({ session });

      const tokensUsed = Math.ceil(fullResponse.split(" ").length / 2);
      await Chat.create(
        [
          {
            userId,
            agentId: AGENT_ID,
            prompt,
            response: fullResponse,
            tokensUsed,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      user.tokens = freshUser.tokens;
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Database transaction error:", dbError);
      return res
        .status(500)
        .json({ error: "Error saving chat or deducting tokens." });
    }

    if (!isFollowUp) promptHistory.set(userId, prompt);
    return res.json({ response: fullResponse, tokensLeft: user.tokens });
  } catch (err) {
    console.error("❌ Error generating script:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
});

router.get("/content/:userId", userAuth, async (req, res) => {
  try {
    const userId = req.params.userId; // from your auth middleware
    const chats = await Chat.find({
      agentId: AGENT_ID,
      userId,
    }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Unable to retrieve chats" });
  }
});

router.delete("/content/:userId", userAuth, async (req, res) => {
  const userId = req.params.userId;
  const { title } = req.body; // e.g. { "title": "Session 1: GST Scripts" }

  try {
    // 1) Fetch all chats for this user & agent
    const chats = await Chat.find({ userId, agentId: AGENT_ID }).sort({
      timestamp: 1,
    });

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
