const express = require("express");
const router = express.Router();
const searchController = require("../controllers/SearchController");
const { isAuthenticated, getTopics } = require("../middlewares/AuthMiddleware");

router.get("/", isAuthenticated, searchController.search);

router.get("/topics", getTopics);

module.exports = router;
