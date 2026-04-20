const { client } = require("../config/elasticsearch");
const logger = require("../config/logger");
const Document = require("../models/Document");

const INDEX_NAME = "docs_oposearch";

const initIndex = async () => {
  const exists = await client.indices.exists({ index: INDEX_NAME });

  try {
    if (!exists || !exists.body) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              name: { type: "text", analyzer: "spanish" },
              forces: { type: "keyword" },
              topics: {
                type: "nested",
                properties: {
                  force:   { type: "keyword" },
                  number:  { type: "integer" },
                  title:   { type: "text", analyzer: "spanish" },
                }
              },
              topicTitles: { type: "text", analyzer: "spanish" },
              titulos: { type: "text", analyzer: "spanish" },
              capitulos: { type: "text", analyzer: "spanish" },
              articulos: { type: "text", analyzer: "spanish" },
              text: { type: "text", analyzer: "spanish" },
            },
          },
        },
      });

      logger.info(`Index '${INDEX_NAME}' created successfully.`, {
        context: "ElasticsearchService",
        index: INDEX_NAME,
      });
    } else {
      logger.info(`Index '${INDEX_NAME}' already exists.`, {
        context: "ElasticsearchService",
        index: INDEX_NAME,
      });
    }
  } catch (error) {
    logger.error(`Error initializing index '${INDEX_NAME}': ${error.message}`, {
      context: "ElasticsearchService",
      index: INDEX_NAME,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const indexDocumentsFromMongo = async () => {
  try {
    await initIndex();

    const documents = await Document.find({});
    if (!documents || documents.length === 0) {
      return {
        success: true,
        message: "No documents found in MongoDB to index.",
      };
    }

    const body = documents.flatMap((doc) => {
      const action = { index: { _index: INDEX_NAME, _id: doc._id.toString() } };
      const payload = {
        name: doc.name,
        forces: doc.forces || [],
        topics: (doc.topics || []).map(t => ({
          force: t.force,
          number: t.number,
          title: t.title,
        })),
        topicTitles: (doc.topics || []).map(t => t.title),
        text: doc.text,
      };
      return [action, payload];
    });

    const bulkResponse = await client.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      const erroredDocuments = [];

      bulkResponse.items.forEach((item) => {
        const operation = Object.keys(item)[0];
        if (item[operation].error) {
          erroredDocuments.push({
            status: item[operation].status,
            error: item[operation].error,
            id: item[operation]._id,
          });
        }
      });

      logger.error("Errors in bulk indexing", { erroredDocuments });
      throw new Error(
        `Errors while indexing ${erroredDocuments.length} documents.`,
      );
    }

    const bulkOps = documents.map((doc) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { elasticsearchId: doc._id.toString() } },
      },
    }));
    await Document.bulkWrite(bulkOps);

    logger.info(`${documents.length} documents correctly indexed.`);
    return {
      success: true,
      message: `${documents.length} documents correctly indexed in Elasticsearch.`,
    };
  } catch (error) {
    logger.error(`Error indexing from MongoDB: ${error.message}`, {
      context: "ElasticsearchService",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const deleteIndex = async () => {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (exists) {
      await client.indices.delete({ index: INDEX_NAME });
      await Document.updateMany({}, { $unset: { elasticsearchId: "" } });
      logger.info(`Index '${INDEX_NAME}' deleted correctly.`);
      return {
        success: true,
        message: `Index '${INDEX_NAME}' deleted successfully.`,
      };
    }
    return { success: true, message: `Index '${INDEX_NAME}' does not exist.` };
  } catch (error) {
    logger.error(`Error deleting index: ${error.message}`, {
      context: "ElasticsearchService",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  initIndex,
  indexDocumentsFromMongo,
  deleteIndex,
};
