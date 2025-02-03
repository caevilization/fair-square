const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base route
app.get("/", (req, res) => {
    res.json({ message: "Code Contribution Analyzer API is running" });
});

// Health check endpoint
app.get("/ping", (req, res) => {
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
    console.error(err.stack);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : {},
    });
});

async function main() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Startup failed:", err);
        process.exit(1);
    }
}

// Start application
main().catch((err) => {
    console.error("Uncaught error:", err);
    process.exit(1);
});
