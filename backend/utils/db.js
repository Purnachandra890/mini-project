const mongoose = require('mongoose');
require("dotenv").config();

async function connectDB() {
    const MongoDbUrl=process.env.MongoDbUrl;
    try {
        const response = await mongoose.connect(MongoDbUrl);
        // mongodb+srv://kuttumurohit:iLlAhYRX00Qeovtm@cluster0.mongodb.net/?retryWrites=true&w=majority

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
