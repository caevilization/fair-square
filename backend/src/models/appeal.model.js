const mongoose = require("mongoose");

const appealSchema = new mongoose.Schema(
    {
        repositoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },
        milestoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Milestone",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["long", "short"],
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        proVotes: [
            {
                contributorId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Contributor",
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        conVotes: [
            {
                contributorId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Contributor",
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contributor",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Appeal", appealSchema);
