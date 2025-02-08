require("dotenv").config();
const { processRepository } = require("../jobs/repositoryAnalysis.job");
const { Repository } = require("../models");
const connectDB = require("../config/database");
const logger = require("../config/logger");

async function debugAnalysis() {
    try {
        // Connect to the database
        await connectDB();

        // Get a pending repository
        const repository = await Repository.findOne({ status: "pending" });

        if (!repository) {
            logger.info("No pending repository found");
            process.exit(0);
        }

        logger.info(`Starting analysis for repository: ${repository.name}`);

        // Perform analysis
        await processRepository(repository);

        logger.info("Analysis completed");
        process.exit(0);
    } catch (error) {
        logger.error("Debug analysis failed:", error);
        process.exit(1);
    }
}

// Run the debug
debugAnalysis();
