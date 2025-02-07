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

// 获取 Judge 详情
exports.getJudgeDetail = async (req, res) => {
    try {
        const { repositoryId } = req.params;

        // 获取仓库信息
        const repository = await Repository.findById(repositoryId);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // 获取里程碑信息及其贡献
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
                        avatar: contribution.contributorId.avatarUrl,
                        name: contribution.contributorId.name,
                        email: contribution.contributorId.email,
                        percentage: Math.round(
                            (contribution.squareCount /
                                milestone.squareReward) *
                                100
                        ),
                        contribution: `Contributed ${contribution.commits.length} commits`,
                        squares: contribution.squareCount,
                    })),
                };
            })
        );

        // 获取共识信息
        const decisions = await Decision.find({ repositoryId }).populate(
            "contributorId"
        );
        const consensusData = {
            progress:
                Math.round(
                    (decisions.filter((d) => d.decision === "approve").length /
                        decisions.length) *
                        100
                ) || 0,
            threshold: 80, // 可以从配置或其他地方获取
            members: decisions.map((decision) => ({
                id: decision.contributorId._id,
                name: decision.contributorId.name,
                avatar: decision.contributorId.avatarUrl,
                percentage: Math.round(
                    (decision.contributorId.totalSquares /
                        repository.totalSquares) *
                        100
                ),
                confirmed: decision.decision === "approve",
            })),
        };

        res.json({
            message: "Judge detail retrieved successfully",
            data: {
                projectBrief: {
                    name: repository.name,
                    stars: repository.stars || 0,
                    status: repository.status,
                    commits: repository.totalCommits || 0,
                    repoLink: repository.url,
                    language: repository.language || "Unknown",
                    lastUpdate: repository.lastAnalyzed,
                },
                progressTree: milestoneDetails,
                consensus: consensusData,
            },
        });
    } catch (error) {
        logger.error("Failed to get judge detail:", error);
        res.status(500).json({
            message: "Failed to get judge detail",
            error: error.message,
        });
    }
};

// 获取 Appeal 列表
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

// 获取 Appeal 消息列表
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

// 创建 Appeal 消息
exports.createAppealMessage = async (req, res) => {
    try {
        const { appealId } = req.params;
        const { content } = req.body;
        const contributorId = req.user._id; // 假设已经通过认证中间件设置了 req.user

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

// 创建决策
exports.createDecision = async (req, res) => {
    try {
        const { repositoryId } = req.params;
        const { decision, reason, milestoneId } = req.body;
        const contributorId = req.user._id; // 假设已经通过认证中间件设置了 req.user

        // 检查是否已经存在决策
        const existingDecision = await Decision.findOne({
            repositoryId,
            milestoneId,
            contributorId,
        });

        if (existingDecision) {
            return res.status(409).json({
                message: "Decision already exists",
            });
        }

        const newDecision = await Decision.create({
            repositoryId,
            milestoneId,
            contributorId,
            decision,
            reason,
        });

        res.status(201).json({
            message: "Decision created successfully",
            data: newDecision,
        });
    } catch (error) {
        logger.error("Failed to create decision:", error);
        res.status(500).json({
            message: "Failed to create decision",
            error: error.message,
        });
    }
};

// 对 Appeal 投票
exports.voteAppeal = async (req, res) => {
    try {
        const { appealId } = req.params;
        const { vote } = req.body; // "pro" or "con"
        const contributorId = req.user._id;

        const appeal = await Appeal.findById(appealId);
        if (!appeal) {
            return res.status(404).json({ message: "Appeal not found" });
        }

        // 检查是否已经投票
        const hasVoted =
            appeal.proVotes.some((v) =>
                v.contributorId.equals(contributorId)
            ) ||
            appeal.conVotes.some((v) => v.contributorId.equals(contributorId));

        if (hasVoted) {
            return res.status(409).json({ message: "Already voted" });
        }

        // 添加投票
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

// 对消息投票
exports.voteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const contributorId = req.user._id;

        const message = await AppealMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // 检查是否已经投票
        if (message.votes.some((v) => v.contributorId.equals(contributorId))) {
            return res.status(409).json({ message: "Already voted" });
        }

        message.votes.push({ contributorId });
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

// 对消息投反对票
exports.vetoMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const contributorId = req.user._id;

        const message = await AppealMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // 检查是否已经投反对票
        if (message.vetoes.some((v) => v.contributorId.equals(contributorId))) {
            return res.status(409).json({ message: "Already vetoed" });
        }

        message.vetoes.push({ contributorId });
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

// 获取 Judge 列表
exports.listJudges = async (req, res) => {
    try {
        // 获取所有处于 handshaking 状态的仓库
        const repositories = await Repository.find({ status: "handshaking" })
            .select("-__v")
            .sort("-lastAnalyzed");

        // 获取每个仓库的详细信息
        const judgeList = await Promise.all(
            repositories.map(async (repo) => {
                // 获取里程碑信息
                const milestone = await Milestone.findOne({
                    repositoryId: repo._id,
                });

                // 获取贡献者信息
                const contributions = await Contribution.find({
                    repositoryId: repo._id,
                }).populate("contributorId");

                // 获取决策信息
                const decisions = await Decision.find({
                    repositoryId: repo._id,
                }).populate("contributorId");

                // 计算共识进度
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
