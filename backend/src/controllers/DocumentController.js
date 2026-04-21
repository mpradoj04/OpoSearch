const path = require("path");
const fs = require("fs");
const { processFile } = require("../services/loadService");
const Topic = require("../models/Topic");
const logger = require("../config/logger");

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            logger.warn("Upload attempted without a PDF file.", {
                context: "DocumentController",
            });
            return res.status(400).json({ error: "A PDF file is required." });
        }
        
        const { force, topics } = req.body;

        const documentName = req.file.originalname.replace(".pdf", "");
        const existing = await Document.findOne({ name: documentName });
        if (existing) {
            fs.unlinkSync(req.file.path);
            logger.warn(`Duplicate document upload attempted: '${documentName}'.`, {
                context: "DocumentController",
            });
            return res.status(409).json({ error: `A document named '${documentName}' already exists.` });
        }

        if (!force || !["guardia_civil", "policia_nacional", "ambos"].includes(force)) {
            logger.warn(`Invalid 'force' value for document '${documentName}': ${force}`, {
                context: "DocumentController",
            });
            return res.status(400).json({
                error: "The 'force' field is required and must be one of: guardia_civil, policia_nacional, ambos.",
            });
        }

        let parsedTopics = [];
        if (topics) {
            try {
                parsedTopics = JSON.parse(topics);
            } catch {
                logger.warn(`Invalid 'topics' value for document '${documentName}': ${topics}`, {
                    context: "DocumentController",
                });
                return res.status(400).json({ error: "The 'topics' field must be a valid JSON array." });
            }
        }

        const topicDocs = { guardia_civil: {}, policia_nacional: {} };
        for (const t of parsedTopics) {
            const topicDoc = await Topic.findOne({ force: t.force, number: t.number });
            if (topicDoc) {
                topicDocs[t.force][t.number] = topicDoc;
            }
        }

        const fileMetadata = { topics: parsedTopics };
        await processFile(
            req.file.path,
            req.file.originalname,
            force,
            fileMetadata,
            topicDocs,
        );

        fs.unlinkSync(req.file.path);

        logger.info(`Document '${req.file.originalname}' uploaded successfully.`, {
            context: "DocumentController",
        });
        return res.status(200).json({ message: "Document processed successfully." });
    } catch (error) {
        logger.error(`Error uploading document '${req.file.originalname}': ${error.message}`, {
            context: "DocumentController",
            message: error.message,
            stack: error.stack,
            });
        return res.status(500).json({ error: "An error occurred while processing the document." });
    }

}

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const documentId = id;

        const result = await deleteDocument(documentId);

        logger.info(`Document with ID ${documentId} deleted successfully.`, {
            context: "DocumentController",
        });
        return res.status(200).json(result);
    } catch (error) {
        logger.error(`Error deleting document with ID ${id}: ${error.message}`, {
            context: "DocumentController",
            message: error.message,
            stack: error.stack,
        });
        return res.status(500).json({ error: "An error occurred while deleting the document." });
    }
}

module.exports = {
    uploadDocument,
    deleteDocument,
};