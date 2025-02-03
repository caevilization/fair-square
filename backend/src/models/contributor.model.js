const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema(
    {
        githubUsername: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        avatarUrl: {
            type: String,
        },
        totalSquares: {
            type: Number,
            default: 0,
            min: 0,
        },
        repositories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Repository",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Contributor", contributorSchema);
