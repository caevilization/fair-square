const express = require("express");
const router = express.Router();
const judgeController = require("../controllers/judge.controller");

// Judge List
router.get("/", judgeController.listJudges);

// Judge Detail
router.get("/:repositoryId", judgeController.getJudgeDetail);

// Decisions
router.get("/:repositoryId/decisions", judgeController.getDecisions);
router.post("/:repositoryId/decisions", judgeController.createDecision);

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
