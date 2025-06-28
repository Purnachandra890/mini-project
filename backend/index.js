const express = require('express');
const cors = require('cors'); // ✅ Import cors
const bodyParser = require('body-parser');
const { connectDB } = require('./utils/db.js');
const authRouter = require('./routes/authRoutes');
const scriptRouter =require('./routes/script.js')
const agentRouter=require('./routes/agents.js')
const captionRouter=require('./routes/caption.js')
const translateRouter=require('./routes/translate.js');
const rewrite=require('./routes/rewrite.js');
const profile = require('./routes/profile.js');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.get('/', (req, res) => {
    console.log("app running");
    res.send("Server is running ✅");
  });
  

  app.use('/auth', authRouter);
  app.use('/script',scriptRouter);
  app.use('/agents',agentRouter);
  app.use('/translate',translateRouter);
  app.use('/captions',captionRouter);
  app.use('/rewrite',rewrite);
  app.use('/profile', profile);


(async () => {
    await connectDB();
    app.listen(3060, () => console.log("✅ Server running on port 3060"));
  })();