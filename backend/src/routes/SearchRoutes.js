const express = require("express");
const router = express.Router();
const searchController = require("../controllers/SearchController");
const { isAuthenticated } = require("../middlewares/AuthMiddleware");

router.get("/", isAuthenticated, searchController.search);

module.exports = router;
