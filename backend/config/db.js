// ← MongoDB connection
// We write the connection once here, and server.js just calls it.

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // MONGO_URI comes from the .env file (secret + easy to change)
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.log(err.message);
        process.exit(1); // stop the server, because the app is useless without a database
    }
};

export default connectDB;
