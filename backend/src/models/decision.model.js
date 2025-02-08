const mongoose = require("mongoose");

const decisionSchema = new mongoose.Schema(
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
        decision: {
            type: String,
            enum: ["approve", "object"],
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
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

// 确保每个贡献者在每个里程碑只能有一个决定
decisionSchema.index(
    { repositoryId: 1, milestoneId: 1, createdBy: 1 },
    { unique: true }
);

module.exports = mongoose.model("Decision", decisionSchema);
