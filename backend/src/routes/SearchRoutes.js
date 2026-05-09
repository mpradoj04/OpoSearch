const express = require("express");
const router = express.Router();
const searchController = require("../controllers/SearchController");
const { isAuthenticated } = require("../middlewares/AuthMiddleware");

router.get("/", isAuthenticated, searchController.search);

router.get("/topics", isAuthenticated, searchController.getTopics);

router.get("/document/:id", isAuthenticated, searchController.showDocument);

module.exports = router;
