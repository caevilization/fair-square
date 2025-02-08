const simpleGit = require("simple-git");
const path = require("path");
const fs = require("fs").promises;
const axios = require("axios");
const { Repository } = require("../models");
const logger = require("../config/logger");

// Extract repository information from GitHub URL
function extractRepoInfo(url) {
    // Support formats:
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    let owner, name;

    if (url.includes("github.com")) {
        const parts = url
            .replace(/\.git$/, "")
            .replace("https://github.com/", "")
            .replace("git@github.com:", "")
            .split("/");
        owner = parts[0];
        name = parts[1];
    }

    if (!owner || !name) {
        throw new Error("Invalid GitHub repository URL");
    }

    return { owner, name };
}

// Check repository limits
async function checkRepoLimits(owner, name) {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${name}`
        );
        const sizeInKB = response.data.size;
        const sizeInMB = sizeInKB / 1024;

        // Check repository size
        if (sizeInMB > 10) {
            throw new Error(
                `Repository size (${sizeInMB.toFixed(
                    2
                )}MB) exceeds limit (10MB)`
            );
        }

        // Get number of commits
        const commitsResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${name}/commits?per_page=1`,
            {
                headers: {
                    Accept: "application/vnd.github.v3.json",
                },
            }
        );

        const totalCommits = parseInt(
            commitsResponse.headers["link"]?.match(
                /page=(\d+)>; rel="last"/
            )?.[1] || 1
        );
        if (totalCommits > 1000) {
            throw new Error(
                `Number of commits (${totalCommits}) exceeds limit (1000)`
            );
        }

        // Get number of contributors
        const contributorsResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${name}/contributors?per_page=1`,
            {
                headers: {
                    Accept: "application/vnd.github.v3.json",
                },
            }
        );

        const totalContributors = parseInt(
            contributorsResponse.headers["link"]?.match(
                /page=(\d+)>; rel="last"/
            )?.[1] || 1
        );
        if (totalContributors > 300) {
            throw new Error(
                `Number of contributors (${totalContributors}) exceeds limit (300)`
            );
        }

        return {
            sizeInMB,
            totalCommits,
            totalContributors,
        };
    } catch (error) {
        if (error.response) {
            throw new Error(
                "GitHub API request failed: " + error.response.data.message
            );
        }
        throw error;
    }
}

// Add new repository
exports.addRepository = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res
                .status(400)
                .json({ message: "Repository URL is required" });
        }

        // Check if repository already exists
        const existingRepo = await Repository.findOne({ url });
        if (existingRepo) {
            return res
                .status(409)
                .json({ message: "Repository already exists" });
        }

        // Extract repository information
        const { owner, name } = extractRepoInfo(url);

        // Check repository limits
        const limits = await checkRepoLimits(owner, name);
        logger.info(
            `Repository limits check passed: size=${limits.sizeInMB.toFixed(
                2
            )}MB, commits=${limits.totalCommits}, contributors=${
                limits.totalContributors
            }`
        );

        // Create local storage directory
        const repoDir = path.join(
            process.env.REPO_STORAGE_PATH,
            `${owner}_${name}`
        );
        await fs.mkdir(repoDir, { recursive: true });

        // Clone repository
        const git = simpleGit();
        await git.clone(url, repoDir);

        // Create repository record
        const repository = await Repository.create({
            url,
            name,
            owner,
            localPath: repoDir,
            status: "pending",
            sizeInMB: parseFloat(limits.sizeInMB.toFixed(2)),
            totalCommits: limits.totalCommits,
            totalContributors: limits.totalContributors,
        });

        res.status(201).json({
            message: "Repository added successfully",
            data: repository,
        });
    } catch (error) {
        logger.error("Failed to add repository:", error);

        // If limit exceeded error, return 413 status code
        if (error.message.includes("exceeds limit")) {
            return res.status(413).json({
                message: "Failed to add repository",
                error: error.message,
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : {},
        });
    }
};

// List repositories
exports.listRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find()
            .select("-__v")
            .sort("-createdAt");

        res.json({
            message: "Repositories retrieved successfully",
            data: repositories,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve repositories",
            error: error.message,
        });
    }
};

// Get single repository
exports.getRepository = async (req, res) => {
    try {
        const repository = await Repository.findById(req.params.id).select(
            "-__v"
        );

        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        res.json({
            message: "Repository retrieved successfully",
            data: repository,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve repository",
            error: error.message,
        });
    }
};
