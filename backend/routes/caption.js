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
const AGENT_ID = "68331d11e9d2c7c3b67f00c2"; // Caption agent

router.post("/content/:userId", userAuth, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.params.userId;

  // Validate prompt existence and type
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Prompt is required and must be a non-empty string." });
  }

  try {
    // Fetch user from DB
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Check token balance before any heavy processing
    if (user.tokens < 10) {
      return res
        .status(403)
        .json({ error: "Insufficient tokens. Please recharge." });
    }

    const normalizedPrompt = prompt.trim().toLowerCase();

    // Greetings handling - respond and do not consume tokens
    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
    if (greetings.includes(normalizedPrompt)) {
      const greetingResponse =
        "👋 Hi there! I'm GenieAI's Caption Generating Agent. I generate captions based on the image description you give. Please describe the image?";
      await Chat.create({
        userId,
        agentId: AGENT_ID,
        prompt,
        response: greetingResponse,
        tokensUsed: 0,
      });
      return res.json({ response: greetingResponse, tokensLeft: user.tokens });
    }

    // Follow-up detection keywords for requests like "some more captions", "expand it", etc.
    const followUpKeywords = [
      "expand it",
      "make it bigger",
      "increase size",
      "add more content",
      "add more examples",
      "make it long",
      "continue it",
      "add details",
      "elaborate",
      "some more captions",
      "more captions",
      "another caption",
      "another one",
      "more like that",
    ];
    const isFollowUp = followUpKeywords.some((keyword) =>
      normalizedPrompt.includes(keyword)
    );

    let finalPrompt = prompt;

    // If this is a follow-up request, reuse previous prompt from history if available
    if (isFollowUp) {
      if (promptHistory.has(userId)) {
        const previousPrompt = promptHistory.get(userId);
        finalPrompt = `Please expand and continue the following caption request with more details and depth:\n\n"${previousPrompt}"`;
      } else {
        // No previous prompt found - ask user to provide image description again
        const noHistoryMsg =
          "Hmm, I don't have your previous image description. Please describe the image again so I can create captions for you!";
        await Chat.create({
          userId,
          agentId: AGENT_ID,
          prompt,
          response: noHistoryMsg,
          tokensUsed: 0,
        });
        return res
          .status(400)
          .json({ response: noHistoryMsg, tokensLeft: user.tokens });
      }
    }

    // Step 1: Intent classification to check if user wants a caption
    const classification = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an intent classifier. If the user is asking for a caption reply with 'yes'. Otherwise reply with 'no'.",
        },
        { role: "user", content: finalPrompt },
      ],
      model: "llama3-8b-8192",
      temperature: 0,
      max_tokens: 1,
    });

    const intent =
      classification.choices[0]?.message?.content?.trim().toLowerCase() || "no";

    if (intent !== "yes") {
      // Not a caption request - send fallback with last 3 captions or no-history message
      const lastChats = await Chat.find({ userId, agentId: AGENT_ID })
        .sort({ timestamp: -1 })
        .limit(3);

      if (lastChats.length > 0) {
        const formattedChats = lastChats
          .map(
            (chat) =>
              `📝 Image desc: ${chat.prompt}\n💡 Caption: ${chat.response}`
          )
          .join("\n\n---\n\n");
        const fallbackMessage = `⚠️ I only generate image captions.\n\nHere are your last 3 captions:\n\n${formattedChats}`;
        await Chat.create({
          userId,
          agentId: AGENT_ID,
          prompt,
          response: fallbackMessage,
          tokensUsed: 0,
        });
        return res.json({ response: fallbackMessage, tokensLeft: user.tokens });
      } else {
        const noHistoryMessage =
          "⚠️ I only generate image captions. You haven't created any yet.";
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
    }

    // Step 2: Generate captions via streaming from the LLM
    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert social-media caption generator. Given an image description, produce 5 short, catchy captions (max 150 characters each) with emojis as appropriate.",
        },
        {
          role: "user",
          content: `Image description: "${finalPrompt}"\n\nPlease generate exactly 5 short, catchy, emoji-rich captions in this format:\n\nHere are five different caption options for the image:\n1. "..."\n2. "..."\n3. "..."\n4. "..."\n5. "..."`,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_completion_tokens: 256,
      top_p: 1,
      stream: true,
    });

    let fullResponse = "";

    // Step 3: Read the streaming response carefully with error handling
    try {
      for await (const chunk of stream) {
        const contentChunk = chunk.choices[0]?.delta?.content;
        if (contentChunk) fullResponse += contentChunk;
      }
    } catch (streamError) {
      console.error("Error reading streaming response:", streamError);
      return res
        .status(500)
        .json({ error: "Failed to read streaming response." });
    }

    // Step 4: Deduct tokens and save chat atomically to avoid race conditions
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
      if (freshUser.tokens < 10) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(403)
          .json({ error: "Insufficient tokens during processing." });
      }

      freshUser.tokens -= 10;
      await freshUser.save({ session });

      await Chat.create(
        [
          {
            userId,
            agentId: AGENT_ID,
            prompt,
            response: fullResponse,
            tokensUsed: 10,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Update user variable with fresh token count after deduction
      user.tokens = freshUser.tokens;
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      console.error("Database transaction error:", dbError);
      return res
        .status(500)
        .json({ error: "Error saving chat or deducting tokens." });
    }

    // Step 5: Save prompt history if this is not a follow-up prompt
    if (!isFollowUp) {
      promptHistory.set(userId, prompt);
    }

    return res
      .status(200)
      .json({ response: fullResponse, tokensLeft: user.tokens });
  } catch (err) {
    console.error("Unexpected error in /content route:", err);
    return res.status(500).json({ error: "Something went wrong." });
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
