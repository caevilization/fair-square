require("dotenv").config();
const { processRepository } = require("../jobs/repositoryAnalysis.job");
const { Repository } = require("../models");
const connectDB = require("../config/database");
const logger = require("../config/logger");

async function debugAnalysis() {
    try {
        // 连接数据库
        await connectDB();

        // 获取一个待处理的仓库
        const repository = await Repository.findOne({ status: "pending" });

        if (!repository) {
            logger.info("No pending repository found");
            process.exit(0);
        }

        logger.info(`Starting analysis for repository: ${repository.name}`);

        // 执行分析
        await processRepository(repository);

        logger.info("Analysis completed");
        process.exit(0);
    } catch (error) {
        logger.error("Debug analysis failed:", error);
        process.exit(1);
    }
}

// 运行调试
debugAnalysis();
