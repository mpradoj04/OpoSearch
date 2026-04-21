const express = require("express");
const router = express.Router();
const documentController = require("../controllers/DocumentController");
const { isAuthenticated, isAdmin } = require("../middlewares/AuthMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post(
  "/upload_document",
  isAuthenticated,
  isAdmin,
  upload.single("file"),
  documentController.uploadDocument,
);

module.exports = router;