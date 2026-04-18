const { client } = require("../config/elasticsearch");
const logger = require("../config/logger");

const searchDocuments = async (queryText) => {
  try {
    const response = await client.search({
      index: "docs_oposearch",
      body: {
        query: {
          multi_match: {
            query: queryText,
            fields: ["name^2", "text"],
          },
        },
        _source: {
          excludes: ["text"],
        },
      },
    });

    const hits = response.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
    }));

    return {
      total: response.hits.total.value,
      documents: hits,
    };
  } catch (error) {
    logger.error(
      `Error buscando documentos en Elasticsearch: ${error.message}`,
    );
    throw error;
  }
};

module.exports = {
  searchDocuments,
};
