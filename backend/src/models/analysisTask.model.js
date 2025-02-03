const mongoose = require("mongoose");

const analysisTaskSchema = new mongoose.Schema(
    {
        repositoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },
        currentCommit: {
            type: String,
            default: null,
        },
        totalCommits: {
            type: Number,
            default: 0,
        },
        processedCommits: {
            type: Number,
            default: 0,
        },
        error: {
            type: String,
            default: null,
        },
        startTime: {
            type: Date,
            default: null,
        },
        endTime: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AnalysisTask", analysisTaskSchema);
