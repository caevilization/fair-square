const {
    Repository,
    Milestone,
    Contribution,
    Contributor,
    Appeal,
    AppealMessage,
    Decision,
} = require("../models");
const logger = require("../config/logger");

// Temporary function: Simulate getting user ID
// TODO: This is a temporary solution and needs to be replaced with a real user authentication system
const fakeGetUserId = async () => {
    let id = await Contributor.findOne().then((contributor) => contributor._id);
    return id;
};

// Get Judge details
exports.getJudgeDetail = async (req, res) => {
    try {
        const { repositoryId } = req.params;

        // Get repository information and populate memberIds
        const repository = await Repository.findById(repositoryId).populate(
            "memberIds"
        );
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Get milestone information and its contributions
        const milestones = await Milestone.find({ repositoryId });
        const milestoneDetails = await Promise.all(
            milestones.map(async (milestone) => {
                const contributions = await Contribution.find({
                    milestoneId: milestone._id,
                }).populate("contributorId");

                return {
                    id: milestone._id,
                    name: milestone.title,
                    squares: milestone.squareReward,
                    percentage: Math.round(
                        (milestone.squareReward / repository.totalSquares) * 100
                    ),
                    description: milestone.description,
                    allocations: contributions.map((contribution) => ({
                        id: contribution.contributorId._id,
                        avatar: contribution.contributorId.avatarUrl,
                        name: contribution.contributorId.name,
                        email: contribution.contributorId.email,
                        percentage: Math.round(
                            (contribution.squareCount /
                                milestone.squareReward) *
                                100
                        ),
                        contribution: contribution.commits
                            .map((commit) => commit.message)
                            .join(", "),
                        squares: contribution.squareCount,
                    })),
                };
            })
        );

        // Get decision information
        const decisions = await Decision.find({ repositoryId }).populate(
            "createdBy"
        );

        // Build consensus data
        const consensusData = {
            progress: Math.round(
                (decisions.length / repository.memberIds.length) * 100
            ),
            threshold: 80,
            members: repository.memberIds.map((member) => ({
                id: member._id,
                name: member.name,
                avatar: member.avatarUrl,
                percentage: Math.round(
                    (member.totalSquares / repository.totalSquares) * 100
                ),
                confirmed: decisions.some(
                    (decision) =>
                        decision.createdBy._id.toString() ===
                        member._id.toString()
                ),
            })),
        };

        res.json({
            message: "Judge details retrieved successfully",
            data: {
                projectBrief: {
                    name: repository.name,
                    stars: 0, // TODO: Get from GitHub API
                    status: repository.status,
                    commits: repository.totalCommits,
                    repoLink: repository.url,
                    language: "JavaScript", // TODO: Get from repository analysis
                    lastUpdate: repository.lastAnalyzed,
                },
                progressTree: milestoneDetails,
                consensus: consensusData,
            },
        });
    } catch (error) {
        logger.error("Failed to get judge details:", error);
        res.status(500).json({
            message: "Failed to get judge details",
            error: error.message,
        });
    }
};

// Get Appeal list
exports.getAppealList = async (req, res) => {
    try {
        const { repositoryId } = req.params;

        const appeals = await Appeal.find({ repositoryId })
            .populate("createdBy")
            .sort("-createdAt");

        const appealList = await Promise.all(
            appeals.map(async (appeal) => {
                const proPercentage =
                    Math.round(
                        (appeal.proVotes.length /
                            (appeal.proVotes.length + appeal.conVotes.length)) *
                            100
                    ) || 0;
                const conPercentage = 100 - proPercentage;

                return {
                    id: appeal._id,
                    title: appeal.title,
                    pro: {
                        percentage: proPercentage,
                        users: await Contributor.find({
                            _id: {
                                $in: appeal.proVotes.map(
                                    (vote) => vote.contributorId
                                ),
                            },
                        })
                            .select("_id avatarUrl")
                            .limit(4),
                    },
                    con: {
                        percentage: conPercentage,
                        users: await Contributor.find({
                            _id: {
                                $in: appeal.conVotes.map(
                                    (vote) => vote.contributorId
                                ),
                            },
                        })
                            .select("_id avatarUrl")
                            .limit(4),
                    },
                };
            })
        );

        res.json({
            message: "Appeal list retrieved successfully",
            data: appealList,
        });
    } catch (error) {
        logger.error("Failed to get appeal list:", error);
        res.status(500).json({
            message: "Failed to get appeal list",
            error: error.message,
        });
    }
};

// Get Appeal message list
exports.getAppealMessages = async (req, res) => {
    try {
        const { appealId } = req.params;

        const messages = await AppealMessage.find({ appealId })
            .populate("contributorId")
            .sort("createdAt");

        const messageList = messages.map((message) => ({
            id: message._id,
            user: {
                name: message.contributorId.name,
                avatar: message.contributorId.avatarUrl,
            },
            content: message.content,
            votes: message.votes.length,
            vetoes: message.vetoes.length,
            timestamp: message.createdAt,
        }));

        res.json({
            message: "Appeal messages retrieved successfully",
            data: messageList,
        });
    } catch (error) {
        logger.error("Failed to get appeal messages:", error);
        res.status(500).json({
            message: "Failed to get appeal messages",
            error: error.message,
        });
    }
};

// Create Appeal message
exports.createAppealMessage = async (req, res) => {
    try {
        const { appealId } = req.params;
        const { content } = req.body;
        const contributorId = await fakeGetUserId(); // Use temporary function

        const message = await AppealMessage.create({
            appealId,
            contributorId,
            content,
        });

        const populatedMessage = await AppealMessage.findById(
            message._id
        ).populate("contributorId");

        res.status(201).json({
            message: "Appeal message created successfully",
            data: {
                id: message._id,
                user: {
                    name: populatedMessage.contributorId.name,
                    avatar: populatedMessage.contributorId.avatarUrl,
                },
                content: message.content,
                votes: 0,
                vetoes: 0,
                timestamp: message.createdAt,
            },
        });
    } catch (error) {
        logger.error("Failed to create appeal message:", error);
        res.status(500).json({
            message: "Failed to create appeal message",
            error: error.message,
        });
    }
};

// Get decision list
exports.getDecisions = async (req, res) => {
    try {
        const { repositoryId } = req.params;
        const decisions = await Decision.find({ repositoryId })
            .populate("createdBy", "name avatar")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: decisions.map((decision) => ({
                id: decision._id,
                decision: decision.decision,
                reason: decision.reason,
                milestoneId: decision.milestoneId,
                createdAt: decision.createdAt,
                createdBy: {
                    id: decision.createdBy._id,
                    name: decision.createdBy.name,
                    avatar: decision.createdBy.avatar,
                },
            })),
        });
    } catch (error) {
        console.error("Error getting decisions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get decision list",
        });
    }
};

// Create decision
exports.createDecision = async (req, res) => {
    try {
        const { repositoryId } = req.params;
        const { decision, reason, milestoneId } = req.body;
        const contributorId = await fakeGetUserId(); // Use temporary function

        // Check if the contributor has already made a decision
        const existingDecision = await Decision.findOne({
            repositoryId,
            milestoneId,
            createdBy: contributorId,
        });

        if (existingDecision) {
            return res.status(409).json({
                success: false,
                message: "The contributor has already made a decision",
            });
        }

        // Create a new decision
        const newDecision = await Decision.create({
            repositoryId,
            milestoneId,
            decision,
            reason,
            createdBy: contributorId,
        });

        // Get contributor information
        const contributor = await Contributor.findById(contributorId);

        res.json({
            success: true,
            data: {
                id: newDecision._id,
                decision: newDecision.decision,
                reason: newDecision.reason,
                milestoneId: newDecision.milestoneId,
                createdAt: newDecision.createdAt,
                createdBy: {
                    id: contributor._id,
                    name: contributor.name,
                    avatar: contributor.avatarUrl,
                },
            },
        });
    } catch (error) {
        console.error("Error creating decision:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create decision",
        });
    }
};

// Vote for Appeal
exports.voteAppeal = async (req, res) => {
    try {
        const { appealId } = req.params;
        const { vote } = req.body; // "pro" or "con"
        const contributorId = await fakeGetUserId(); // Use temporary function

        const appeal = await Appeal.findById(appealId);
        if (!appeal) {
            return res.status(404).json({ message: "Appeal not found" });
        }

        // Check if the vote has already been cast
        const hasVoted =
            appeal.proVotes.some((v) =>
                v.contributorId.equals(contributorId)
            ) ||
            appeal.conVotes.some((v) => v.contributorId.equals(contributorId));

        if (hasVoted) {
            return res.status(409).json({ message: "Already voted" });
        }

        // Add vote
        if (vote === "pro") {
            appeal.proVotes.push({ contributorId });
        } else {
            appeal.conVotes.push({ contributorId });
        }

        await appeal.save();

        res.json({
            message: "Vote recorded successfully",
            data: {
                proVotes: appeal.proVotes.length,
                conVotes: appeal.conVotes.length,
            },
        });
    } catch (error) {
        logger.error("Failed to vote on appeal:", error);
        res.status(500).json({
            message: "Failed to vote on appeal",
            error: error.message,
        });
    }
};

// Vote for message
exports.voteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const contributorId = await fakeGetUserId(); // Use temporary function

        const message = await AppealMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the vote has already been cast
        if (message.votes.some((v) => v.contributorId.equals(contributorId))) {
            return res.status(409).json({ message: "Already voted" });
        }

        // Add new vote
        message.votes.push({ contributorId, timestamp: new Date() });
        await message.save();

        res.json({
            message: "Vote recorded successfully",
            data: {
                votes: message.votes.length,
                vetoes: message.vetoes.length,
            },
        });
    } catch (error) {
        logger.error("Failed to vote on message:", error);
        res.status(500).json({
            message: "Failed to vote on message",
            error: error.message,
        });
    }
};

// Vote against message
exports.vetoMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const contributorId = await fakeGetUserId(); // Use temporary function

        const message = await AppealMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the veto has already been cast
        if (message.vetoes.some((v) => v.contributorId.equals(contributorId))) {
            return res.status(409).json({ message: "Already vetoed" });
        }

        // Add new veto
        message.vetoes.push({ contributorId, timestamp: new Date() });
        await message.save();

        res.json({
            message: "Veto recorded successfully",
            data: {
                votes: message.votes.length,
                vetoes: message.vetoes.length,
            },
        });
    } catch (error) {
        logger.error("Failed to veto message:", error);
        res.status(500).json({
            message: "Failed to veto message",
            error: error.message,
        });
    }
};

// Get Judge list
exports.listJudges = async (req, res) => {
    try {
        // Get all repositories in handshaking status
        const repositories = await Repository.find()
            .select("-__v")
            .sort("-lastAnalyzed");

        // Get detailed information for each repository
        const judgeList = await Promise.all(
            repositories.map(async (repo) => {
                // Get milestone information
                const milestone = await Milestone.findOne({
                    repositoryId: repo._id,
                });

                // Get contributor information
                const contributions = await Contribution.find({
                    repositoryId: repo._id,
                }).populate("contributorId");

                // Get decision information
                const decisions = await Decision.find({
                    repositoryId: repo._id,
                }).populate("contributorId");

                // Calculate consensus progress
                const consensusProgress =
                    decisions.length > 0
                        ? Math.round(
                              (decisions.filter((d) => d.decision === "approve")
                                  .length /
                                  decisions.length) *
                                  100
                          )
                        : 0;

                return {
                    id: repo._id,
                    name: repo.name,
                    owner: repo.owner,
                    status: repo.status,
                    lastAnalyzed: repo.lastAnalyzed,
                    totalSquares: repo.totalSquares,
                    totalCommits: repo.totalCommits,
                    consensusProgress,
                    contributors: contributions.map((c) => ({
                        id: c.contributorId._id,
                        name: c.contributorId.name,
                        avatar: c.contributorId.avatarUrl,
                        squares: c.squareCount,
                    })),
                };
            })
        );

        res.json({
            message: "Judge list retrieved successfully",
            data: judgeList,
        });
    } catch (error) {
        logger.error("Failed to get judge list:", error);
        res.status(500).json({
            message: "Failed to get judge list",
            error: error.message,
        });
    }
};
