const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const { scheduleAnalysisJob } = require("./jobs/repositoryAnalysis.job");
const logger = require("./config/logger");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/ping", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Register routes
const repositoryRoutes = require("./routes/repository.routes");
app.use("/api/repositories", repositoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : {},
    });
});

async function main() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start cron jobs
        scheduleAnalysisJob();
        logger.info("Repository analysis job scheduled");

        // Start server
        app.listen(port, () => {
            logger.info(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        logger.error("Startup failed:", err);
        process.exit(1);
    }
}

// Start application
main().catch((err) => {
    logger.error("Uncaught error:", err);
    process.exit(1);
});
