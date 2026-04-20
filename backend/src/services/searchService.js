const { client } = require("../config/elasticsearch");
const logger = require("../config/logger");

const searchDocuments = async (queryText, force, topic, page = 1, limit = 10) => {
  try {
    const filters = [];

    if (force) {
      filters.push({ term: { forces: force } });
    }

    if (topic) {
      filters.push({
        nested: {
          path: "topics",
          query: {
            bool: {
              must: [
                { term: { "topics.number": parseInt(topic, 10) } },
                ...(force ? [{ term: { "topics.force": force } }] : []),
              ],
            },
          },
        },
      });
    }

    const queryOpts = {
      bool: {
        ...(queryText
          ? {
              must: {
                multi_match: {
                  query: queryText,
                  fields: ["name^3", "text", "topicTitles^2"],
                },
              },
            }
          : { must: { match_all: {} } }),
        ...(filters.length > 0 && { filter: filters }),
      },
    };


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
