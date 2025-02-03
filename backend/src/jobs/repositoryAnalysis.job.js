const cron = require("node-cron");
const { Repository, AnalysisTask } = require("../models");
const logger = require("../config/logger");

// Function to process a single repository
async function processRepository(repository) {
    try {
        // Double check if repository is still pending
        const currentRepo = await Repository.findById(repository._id);
        if (!currentRepo || currentRepo.status !== "pending") {
            logger.info(
                `Repository ${repository._id} is no longer pending, skipping...`
            );
            return;
        }

        // TODO: Implement repository analysis logic
        logger.info(`Processing repository: ${repository.name}`);
    } catch (error) {
        logger.error(`Error processing repository ${repository._id}:`, error);
    }
}

// Function to find and process pending repositories
async function processPendingRepositories() {
    try {
        // Find repositories that need analysis, limit to 5
        const pendingRepositories = await Repository.find({
            status: "pending",
        }).limit(5);

        logger.info(
            `Found ${pendingRepositories.length} pending repositories (processing max 5)`
        );

        // Process each repository
        for (const repository of pendingRepositories) {
            await processRepository(repository);
        }
    } catch (error) {
        logger.error("Error in processPendingRepositories:", error);
    }
}

// Schedule the job
// Run every minute
const scheduleAnalysisJob = () => {
    cron.schedule("* * * * *", async () => {
        logger.info("Running repository analysis job...");
        await processPendingRepositories();
    });
};

module.exports = {
    scheduleAnalysisJob,
    processRepository, // Exported for testing
    processPendingRepositories, // Exported for testing
};
