const mongoose = require("mongoose");
const logger = require("./logger");

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function retryConnection(retries = 0) {
    try {
        // Replace password placeholder in MongoDB URI
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

        // Connection successful
        logger.info(`MongoDB connected successfully: ${conn.connection.host}`);

        return conn;
    } catch (err) {
        if (retries < MAX_RETRIES) {
            logger.error(
                `MongoDB connection attempt ${retries + 1} failed:`,
                err
            );
            logger.warn(`Retrying in ${RETRY_DELAY / 1000} seconds...`);

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

            // Recursive retry
            return retryConnection(retries + 1);
        }

        throw err;
    }
}

async function connectDB() {
    try {
        const conn = await retryConnection();

        // Set up connection event handlers
        mongoose.connection.on("error", (err) => {
            logger.error("MongoDB connection error:", err);
            logger.info("Attempting to reconnect...");
            retryConnection().catch((retryError) => {
                logger.error("Reconnection failed:", retryError);
            });
        });

        mongoose.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected, attempting to reconnect...");
            retryConnection().catch((retryError) => {
                logger.error("Reconnection failed:", retryError);
            });
        });

        mongoose.connection.on("reconnected", () => {
            logger.info("MongoDB reconnected successfully");
        });

        // Handle process termination
        process.on("SIGINT", async () => {
            try {
                await mongoose.connection.close();
                logger.info("MongoDB connection closed");
                process.exit(0);
            } catch (err) {
                logger.error("Error closing MongoDB connection:", err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        logger.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

module.exports = connectDB;
