const cron = require("node-cron");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs").promises;
const { Repository, AnalysisTask } = require("../models");
const logger = require("../config/logger");

// Function to get commit details
async function getCommitDetails(git, commitHash) {
    try {
        // 分别获取提交信息和文件变更
        // 1. 获取提交基本信息，使用 %B 获取完整提交信息，避免转义问题
        const [rawHash, rawAuthor, rawEmail, rawDate, rawMessage] =
            await Promise.all([
                git.raw(["show", "-s", "--format=%H", commitHash]),
                git.raw(["show", "-s", "--format=%an", commitHash]),
                git.raw(["show", "-s", "--format=%ae", commitHash]),
                git.raw(["show", "-s", "--format=%ai", commitHash]),
                git.raw(["show", "-s", "--format=%B", commitHash]),
            ]);

        // 构建提交信息对象
        const commit = {
            hash: rawHash.trim(),
            author: rawAuthor.trim(),
            email: rawEmail.trim(),
            date: rawDate.trim(),
            message: rawMessage.trim(),
        };

        // 2. 获取文件变更列表
        const changedFiles = await git.raw([
            "diff-tree",
            "--no-commit-id",
            "--name-status",
            "-r",
            commitHash,
        ]);

        // 解析文件变更信息
        const fileChanges = changedFiles
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
                const [status, file] = line.split(/\s+/);
                return { status, file };
            });

        // 3. 获取文件变更统计
        let stats;
        try {
            // 尝试获取与父提交的差异
            stats = await git.raw([
                "diff",
                "--numstat",
                `${commitHash}^..${commitHash}`,
            ]);
        } catch (error) {
            // 如果是第一个提交，获取完整文件统计
            logger.info(
                `First commit detected for ${commitHash}, using special handling`
            );
            stats = await git.raw([
                "show",
                "--numstat",
                "--format=", // 空格式，只显示统计信息
                commitHash,
            ]);
        }

        // 解析文件变更统计
        const fileStats = stats
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
                const [additions, deletions, file] = line.split("\t");
                return {
                    file,
                    additions: parseInt(additions) || 0,
                    deletions: parseInt(deletions) || 0,
                };
            });

        // 4. 获取每个文件的具体代码变更
        const fileDetails = await Promise.all(
            fileStats.map(async (file) => {
                try {
                    let patch;
                    try {
                        // 尝试获取与父提交的差异
                        patch = await git.show([
                            "--patch",
                            "--unified=3",
                            `${commitHash}^..${commitHash}`,
                            "--",
                            file.file,
                        ]);
                    } catch (error) {
                        // 如果是第一个提交，获取完整文件内容作为添加的内容
                        patch = await git.show([
                            "--patch",
                            "--unified=3",
                            commitHash,
                            "--",
                            file.file,
                        ]);
                    }

                    // 解析变更内容
                    const changes = patch
                        .split("\n")
                        .filter(
                            (line) =>
                                !line.startsWith("diff") &&
                                !line.startsWith("index")
                        )
                        .join("\n");

                    return {
                        ...file,
                        status:
                            fileChanges.find((f) => f.file === file.file)
                                ?.status || "A", // 对于第一个提交，默认为添加
                        patch: changes,
                        chunks: changes
                            .split(/^@@.+@@$/m)
                            .filter((chunk) => chunk.trim())
                            .map((chunk) => {
                                const lines = chunk.split("\n");
                                return {
                                    added: lines.filter((line) =>
                                        line.startsWith("+")
                                    ),
                                    removed: lines.filter((line) =>
                                        line.startsWith("-")
                                    ),
                                    context: lines.filter(
                                        (line) =>
                                            !line.startsWith("+") &&
                                            !line.startsWith("-")
                                    ),
                                };
                            }),
                    };
                } catch (error) {
                    logger.error(
                        `Error getting patch for file ${file.file}:`,
                        error
                    );
                    return {
                        ...file,
                        status:
                            fileChanges.find((f) => f.file === file.file)
                                ?.status || "M",
                        patch: null,
                        error: error.message,
                    };
                }
            })
        );

        return {
            ...commit,
            files: fileDetails,
        };
    } catch (error) {
        logger.error(`Error getting commit details for ${commitHash}:`, error);
        throw error;
    }
}

// Function to calculate author contributions
function calculateAuthorContributions(commitDetails) {
    const authorStats = {};

    commitDetails.forEach((commit) => {
        const author = commit.author;
        const email = commit.email;
        const key = `${author} <${email}>`;

        if (!authorStats[key]) {
            authorStats[key] = {
                commitCount: 0,
                additions: 0,
                deletions: 0,
                totalChanges: 0,
            };
        }

        authorStats[key].commitCount++;

        commit.files.forEach((file) => {
            authorStats[key].additions += file.additions;
            authorStats[key].deletions += file.deletions;
            authorStats[key].totalChanges += file.additions + file.deletions;
        });
    });

    return authorStats;
}

// Function to format author contributions
function formatAuthorContributions(authorStats) {
    return Object.entries(authorStats)
        .map(([author, stats]) => {
            return `Author: ${author}
    Commits: ${stats.commitCount}
    Lines Added: ${stats.additions}
    Lines Deleted: ${stats.deletions}
    Total Changes: ${stats.totalChanges}`;
        })
        .join("\n\n");
}

// Function to generate analysis reports (both detailed and summary)
async function generateAnalysisReports(commitDetails, repoPath) {
    try {
        // 创建报告目录
        const reportsDir = path.join(process.cwd(), "reports");
        await fs.mkdir(reportsDir, { recursive: true });

        const repoName = path.basename(repoPath);
        const detailedReportPath = path.join(
            reportsDir,
            `${repoName}.detailed.txt`
        );
        const summaryReportPath = path.join(
            reportsDir,
            `${repoName}.summary.txt`
        );

        // 计算作者贡献统计
        const authorStats = calculateAuthorContributions(commitDetails);
        const authorContributions = formatAuthorContributions(authorStats);

        // 生成详细报告内容
        const detailedContent = `Repository Analysis Report (Detailed)
=================================

Author Contributions
------------------
${authorContributions}

Commit History
-------------
${commitDetails
    .map((commit) => {
        const filesInfo = commit.files
            .map((file) => {
                return `    File: ${file.file}
    Status: ${file.status}
    Changes: +${file.additions} -${file.deletions}
    Patch:
${file.patch || "No patch available"}
    ----------------------------------------`;
            })
            .join("\n");

        return `Commit: ${commit.hash}
Author: ${commit.author} <${commit.email}>
Date: ${commit.date}
Message: ${commit.message}

Files Changed:
${filesInfo}
==========================================`;
    })
    .join("\n\n")}`;

        // 生成摘要报告内容
        const summaryContent = `Repository Analysis Report (Summary)
================================

Author Contributions
------------------
${authorContributions}

Commit History
-------------
${commitDetails
    .map((commit) => {
        const filesInfo = commit.files
            .map((file) => {
                return `    File: ${file.file}
    Status: ${file.status}
    Changes: +${file.additions} -${file.deletions}`;
            })
            .join("\n");

        return `Commit: ${commit.hash}
Author: ${commit.author} <${commit.email}>
Date: ${commit.date}
Message: ${commit.message}

Files Changed:
${filesInfo}
==========================================`;
    })
    .join("\n\n")}`;

        // 写入报告文件
        await Promise.all([
            fs.writeFile(detailedReportPath, detailedContent, "utf8"),
            fs.writeFile(summaryReportPath, summaryContent, "utf8"),
        ]);

        logger.info(`Analysis reports saved to: 
    Detailed: ${detailedReportPath}
    Summary: ${summaryReportPath}`);

        return {
            detailedReportPath,
            summaryReportPath,
        };
    } catch (error) {
        logger.error("Error generating analysis reports:", error);
        throw error;
    }
}

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

        // 将相对路径转换为绝对路径
        const absolutePath = path.join(process.cwd(), repository.localPath);
        logger.info(`Processing repository at path: ${absolutePath}`);

        // 初始化 git 实例
        const git = simpleGit(absolutePath);

        // 尝试切换到主分支（main 或 master）
        try {
            await git.checkout("main");
            logger.info("Switched to main branch");
        } catch (branchError) {
            logger.info("main branch not found, trying master branch");
            try {
                await git.checkout("master");
                logger.info("Switched to master branch");
            } catch (masterError) {
                logger.error("Neither main nor master branch found");
                throw new Error("Could not find main or master branch");
            }
        }

        // 获取所有提交历史
        const logs = await git.log();

        // 存储每个提交的详细信息
        const commitDetails = [];

        // 获取每个提交的详细信息
        for (const commit of logs.all) {
            const details = await getCommitDetails(git, commit.hash);
            commitDetails.push(details);

            logger.info(
                `Processed commit: ${commit.hash.substring(0, 7)} by ${
                    details.author
                }`
            );
        }

        // 生成分析报告
        await generateAnalysisReports(commitDetails, repository.localPath);

        // TODO: 在这里可以进行数据分析和存储
        // 例如：
        // - 按作者统计贡献
        // - 分析文件变更模式
        // - 计算代码复杂度变化
        // - 识别关键提交

        logger.info(`Completed analysis for repository: ${repository.name}`);
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
