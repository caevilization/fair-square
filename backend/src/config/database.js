const mongoose = require("mongoose");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const mongoURI = process.env.MONGODB_URI.replace(
                "<db_password>",
                process.env.MONGODB_PASSWORD
            );

            const options = {
                dbName: process.env.MONGODB_DB_NAME,
                retryWrites: true,
                w: "majority",
            };

            const conn = await mongoose.connect(mongoURI, options);
            console.log(
                `MongoDB connected successfully: ${conn.connection.host}`
            );
            return conn;
        } catch (error) {
            if (i === retries - 1) {
                console.error(
                    "MongoDB connection failed, max retries reached:",
                    error
                );
                throw error;
            }
            console.warn(
                `MongoDB connection failed, retrying in 5 seconds (attempt ${
                    i + 2
                } of ${retries})...`
            );
            await sleep(5000);
        }
    }
};

const connectDB = async () => {
    try {
        const conn = await connectWithRetry();

        // Monitor connection errors
        mongoose.connection.on("error", async (err) => {
            console.error("MongoDB connection error:", err);
            console.log("Attempting to reconnect...");
            try {
                await connectWithRetry();
            } catch (retryError) {
                console.error("Reconnection failed:", retryError);
            }
        });

        // Monitor disconnections
        mongoose.connection.on("disconnected", async () => {
            console.warn("MongoDB disconnected, attempting to reconnect...");
            try {
                await connectWithRetry();
            } catch (retryError) {
                console.error("Reconnection failed:", retryError);
            }
        });

        // Monitor reconnections
        mongoose.connection.on("reconnected", () => {
            console.info("MongoDB reconnected successfully");
        });

        // Graceful shutdown
        process.on("SIGINT", async () => {
            try {
                await mongoose.connection.close();
                console.log("MongoDB connection closed");
                process.exit(0);
            } catch (err) {
                console.error("Error closing MongoDB connection:", err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
