const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/Genie_Ai');
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    passwordHash: String,
    tokens: { type: Number, default: 1000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  });
  
  const agentSchema = new mongoose.Schema({
    name: String,
    description: String,
    modelId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  });
  
  const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
    prompt: String,
    response: String,
    tokensUsed: Number,
    timestamp: { type: Date, default: Date.now },
  });


const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  title: { type: String }, // Optional: like "Podcast script 1"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const imageGenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" }, // ✅ add this
  prompt: String,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Agent = mongoose.model('Agent', agentSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Session = mongoose.model("Session", sessionSchema);
const ImageGen = mongoose.model("ImageGen", imageGenSchema);



module.exports = {
    Agent,
    User,
    Chat,
    Session,
    ImageGen
}