// routes/agentRoutes.js
const express = require('express');
// const { authenticateUser } = require('../middlewares/authMiddleware'); // if you want to protect it
const router = express.Router();
const {Agent}=require('../models/schema')

// POST /agents
// Creates a new agent and returns its id
router.post('/', /* authenticateUser,  */ async (req, res) => {
  const { name, description, modelId } = req.body;

  if (!name || !modelId) {
    return res.status(400).json({ error: '`name` and `modelId` are required' });
  }

  try {
    const agent = new Agent({
      name,
      description,
      modelId,
      updatedAt: new Date(),
    });

    await agent.save();

    // Return only the new agent's id
    return res.status(201).json({ agentId: agent._id });
  } catch (err) {
    console.error('Error creating agent:', err);
    return res.status(500).json({ error: 'Failed to create agent' });
  }
});

module.exports = router;
