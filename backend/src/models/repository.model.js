const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        owner: {
            type: String,
            required: true,
        },
        lastAnalyzed: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "analyzing", "completed", "failed"],
            default: "pending",
        },
        localPath: {
            type: String,
            required: true,
        },
        sizeInMB: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Repository", repositorySchema);
