const express = require("express");
const router = express.Router();
const repositoryController = require("../controllers/repository.controller");

// Repository management routes
router.post("/", repositoryController.addRepository);
router.get("/", repositoryController.listRepositories);
router.get("/:id", repositoryController.getRepository);

module.exports = router;
