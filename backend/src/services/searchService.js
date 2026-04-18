const { client } = require("../config/elasticsearch");
const logger = require("../config/logger");

const searchDocuments = async (queryText, force) => {
  try {
    const queryOpts = {
      bool: {
        must: {
          multi_match: {
            query: queryText,
            fields: ["name^2", "text"],
          },
        },
      },
    };

    if (force) {
      queryOpts.bool.filter = {
        term: {
          forces: force,
        },
      };
    }

    const response = await client.search({
      index: "docs_oposearch",
      body: {
        query: queryOpts,
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
