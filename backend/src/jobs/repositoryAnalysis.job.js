const cron = require("node-cron");
const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs").promises;
const {
    Repository,
    AnalysisTask,
    Milestone,
    Contribution,
    Contributor,
} = require("../models");
const logger = require("../config/logger");
const md5 = require("md5");

// Function to get commit details
async function getCommitDetails(git, commitHash) {
    try {
        // Get commit details and file changes separately
        // 1. Get commit basic information, use %B to get complete commit message to avoid escape problem
        const [rawHash, rawAuthor, rawEmail, rawDate, rawMessage] =
            await Promise.all([
                git.raw(["show", "-s", "--format=%H", commitHash]),
                git.raw(["show", "-s", "--format=%an", commitHash]),
                git.raw(["show", "-s", "--format=%ae", commitHash]),
                git.raw(["show", "-s", "--format=%ai", commitHash]),
                git.raw(["show", "-s", "--format=%B", commitHash]),
            ]);

        // Build commit information object
        const commit = {
            hash: rawHash.trim(),
            author: rawAuthor.trim(),
            email: rawEmail.trim(),
            date: rawDate.trim(),
            message: rawMessage.trim(),
        };

        // 2. Get file change list
        const changedFiles = await git.raw([
            "diff-tree",
            "--no-commit-id",
            "--name-status",
            "-r",
            commitHash,
        ]);

        // Parse file change information
        const fileChanges = changedFiles
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
                const [status, file] = line.split(/\s+/);
                return { status, file };
            });

        // 3. Get file change statistics
        let stats;
        try {
            // Try to get the difference with the parent commit
            stats = await git.raw([
                "diff",
                "--numstat",
                `${commitHash}^..${commitHash}`,
            ]);
        } catch (error) {
            // If it is the first commit, get the complete file statistics
            logger.info(
                `First commit detected for ${commitHash}, using special handling`
            );
            stats = await git.raw([
                "show",
                "--numstat",
                "--format=", // Empty format, only display statistics
                commitHash,
            ]);
        }

        // Parse file change statistics
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

        // 4. Get specific code changes for each file
        const fileDetails = await Promise.all(
            fileStats.map(async (file) => {
                try {
                    let patch;
                    try {
                        // Try to get the difference with the parent commit
                        patch = await git.show([
                            "--patch",
                            "--unified=3",
                            `${commitHash}^..${commitHash}`,
                            "--",
                            file.file,
                        ]);
                    } catch (error) {
                        // If it is the first commit, get the complete file content as added content
                        patch = await git.show([
                            "--patch",
                            "--unified=3",
                            commitHash,
                            "--",
                            file.file,
                        ]);
                    }

                    // Parse the change content
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
                                ?.status || "A", // For the first commit, default to added
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
        // Create reports directory
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

        // Calculate author contributions
        const authorStats = calculateAuthorContributions(commitDetails);
        const authorContributions = formatAuthorContributions(authorStats);

        // Generate detailed report content
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

        // Generate summary report content
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

        // Write to report files
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

        // Update status to analyzing
        repository.status = "analyzing";
        await repository.save();

        // Convert relative path to absolute path
        const absolutePath = path.join(process.cwd(), repository.localPath);
        logger.info(`Processing repository at path: ${absolutePath}`);

        // Initialize git instance
        const git = simpleGit(absolutePath);

        // Try to switch to the main branch (main or master)
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

        // Get all commit history
        const logs = await git.log();

        // Store detailed information of each commit
        const commitDetails = [];

        // Get detailed information of each commit
        for (const commit of logs.all) {
            const details = await getCommitDetails(git, commit.hash);
            commitDetails.push(details);

            logger.info(
                `Processed commit: ${commit.hash.substring(0, 7)} by ${
                    details.author
                }`
            );
        }

        // Generate analysis reports
        await generateAnalysisReports(commitDetails, repository.localPath);

        // Calculate total score
        const totalCommits = commitDetails.length;
        let totalLineChanges = 0;
        const authorStats = {};

        // Calculate contributions of each author
        commitDetails.forEach((commit) => {
            const author = commit.author;
            const email = commit.email;
            const key = `${author}|${email}`;

            if (!authorStats[key]) {
                authorStats[key] = {
                    name: author,
                    email: email,
                    commits: 0,
                    additions: 0,
                    deletions: 0,
                    totalChanges: 0,
                };
            }

            authorStats[key].commits++;
            commit.files.forEach((file) => {
                authorStats[key].additions += file.additions;
                authorStats[key].deletions += file.deletions;
                authorStats[key].totalChanges +=
                    file.additions + file.deletions;
                totalLineChanges += file.additions + file.deletions;
            });
        });

        // Calculate total squares
        const totalSquares = Math.floor(totalCommits * 500 + totalLineChanges);

        // Create milestone
        const milestone = await Milestone.create({
            repositoryId: repository._id,
            title: "Initial Milestone",
            description: "TODO: Initial analysis of repository contributions",
            squareReward: totalSquares,
            startCommit: logs.all[logs.all.length - 1].hash,
            endCommit: logs.all[0].hash,
            startDate: new Date(logs.all[logs.all.length - 1].date),
            endDate: new Date(logs.all[0].date),
            status: "completed",
        });

        // Update contributor statistics
        const contributors = [];

        // Process each contributor
        for (const [email, stats] of Object.entries(authorStats)) {
            const contributor = await Contributor.findOneAndUpdate(
                { email },
                {
                    $setOnInsert: {
                        githubUsername: stats.username || email.split("@")[0],
                        name: stats.name || email.split("@")[0],
                        email: email,
                        avatarUrl:
                            stats.avatarUrl ||
                            `https://www.gravatar.com/avatar/${md5(
                                email
                            )}?d=identicon`,
                    },
                    $inc: { totalSquares: stats.squares },
                    $addToSet: { repositories: repository._id },
                },
                { upsert: true, new: true }
            );
            contributors.push(contributor);
        }

        // Update repository information
        await Repository.findByIdAndUpdate(repository._id, {
            status: "handshaking",
            lastAnalyzed: new Date(),
            totalCommits: commitDetails.length,
            totalContributors: contributors.length,
            totalSquares: contributors.reduce(
                (sum, c) => sum + c.totalSquares,
                0
            ),
            memberIds: contributors.map((c) => c._id),
        });

        logger.info(`Completed analysis for repository: ${repository.name}`);
    } catch (error) {
        logger.error("Repository analysis failed:", error);
        await Repository.findByIdAndUpdate(repository._id, {
            status: "failed",
        });
        throw error;
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
