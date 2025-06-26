const mongoose = require('mongoose');

async function connectDB() {
    try {
        const response = await mongoose.connect('mongodb+srv://GenieAi:DOXq5BGEHMjFx8bQ@cluster0.gw5whgn.mongodb.net/');
        if (response) {
            console.log("✅ Successfully connected to the database");
        }
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
}

module.exports = {
    connectDB
};
