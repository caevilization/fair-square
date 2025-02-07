const express = require("express");
const router = express.Router();
const judgeController = require("../controllers/judge.controller");

// Judge List
router.get("/", judgeController.listJudges);

// Judge Detail
router.get("/:repositoryId", judgeController.getJudgeDetail);

// Appeals
router.get("/:repositoryId/appeals", judgeController.getAppealList);
router.get(
    "/:repositoryId/appeals/:appealId/messages",
    judgeController.getAppealMessages
);
router.post(
    "/:repositoryId/appeals/:appealId/messages",
    judgeController.createAppealMessage
);

// Decisions
router.post("/:repositoryId/decisions", judgeController.createDecision);

// Appeal Votes
router.post(
    "/:repositoryId/appeals/:appealId/vote",
    judgeController.voteAppeal
);
router.post(
    "/:repositoryId/appeals/:appealId/messages/:messageId/vote",
    judgeController.voteMessage
);
router.post(
    "/:repositoryId/appeals/:appealId/messages/:messageId/veto",
    judgeController.vetoMessage
);

module.exports = router;
