const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    filesChanged: {
        type: Number,
        required: true,
        min: 0,
    },
    additions: {
        type: Number,
        required: true,
        min: 0,
    },
    deletions: {
        type: Number,
        required: true,
        min: 0,
    },
});

const contributionSchema = new mongoose.Schema(
    {
        milestoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Milestone",
            required: true,
        },
        repositoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },
        contributorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contributor",
            required: true,
        },
        squareCount: {
            type: Number,
            required: true,
            min: 0,
        },
        commits: [commitSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Contribution", contributionSchema);
