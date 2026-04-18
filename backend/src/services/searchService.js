const { client } = require("../config/elasticsearch");
const logger = require("../config/logger");

const searchDocuments = async (queryText, force, page = 1, limit = 10) => {
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

    const from = (page - 1) * limit;

    const response = await client.search({
      index: "docs_oposearch",
      from: from,
      size: limit,
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

    const totalVal =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total.value;

    return {
      total: totalVal,
      totalPages: Math.ceil(totalVal / limit),
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
