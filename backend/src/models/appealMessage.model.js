const mongoose = require("mongoose");

const appealMessageSchema = new mongoose.Schema(
    {
        appealId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appeal",
            required: true,
        },
        contributorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contributor",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        votes: [
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
        vetoes: [
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
    },
    {
        timestamps: true,
    }
);

// 创建复合索引以优化查询性能
appealMessageSchema.index({ appealId: 1, createdAt: -1 });

module.exports = mongoose.model("AppealMessage", appealMessageSchema);
