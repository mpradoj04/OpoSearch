const { client } = require("../config/elasticsearch");
const logger = require("../config/logger");
const Topic = require("../models/Topic")

const searchDocuments = async (queryText, force, topic, page = 1, limit = 10, sort = "relevance") => {
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

    const SORT_OPTIONS = {
      relevance: [{ _score: "desc" }],
      name_asc:  [{ "name.keyword": "asc" }],
      name_desc: [{ "name.keyword": "desc" }],
    };

    const sortQuery = SORT_OPTIONS[sort] || SORT_OPTIONS.relevance;

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
        sort: sortQuery,
        _source: {
          excludes: ["text"],
        },
        highlight: {
          max_analyzed_offset: 999999,
          fields: {
            text: {
              fragment_size: 200,       
              number_of_fragments: 3,   
            },
            name: {
              number_of_fragments: 0,   
            },
            topicTitles: {
              number_of_fragments: 0,
            },
          },
          pre_tags: ["<mark>"],         
          post_tags: ["</mark>"],       
        },
      },
    });

    const hits = response.hits.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      ...hit._source,
      highlights: hit.highlight || {},
    }));

    const totalVal =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total.value;

    logger.info("Search executed", {
      context: "SearchService",
      query: queryText || null,
      force: force || null,
      topic: topic || null,
      totalResults: totalVal,
      page
    });

    return {
      total: totalVal,
      totalPages: Math.ceil(totalVal / limit),
      documents: hits,
    };
  } catch (error) {
    logger.error(
      `Error searching documents in Elasticsearch: ${error.message}`,
    );
    throw error;
  }
};

const getTopics = async (force) => {
  try {
    const filter = force ? { force } : {};
 
    const topics = await Topic.find(filter)
      .select("number title force block")
      .sort({ force: 1, number: 1 })
      .lean();
 
    logger.info("Topics fetched", {
      context: "SearchService",
      force: force || null,
      total: topics.length,
    });
 
    return topics;
  } catch (error) {
    logger.error(`Error fetching topics: ${error.message}`, {
      context: "SearchService",
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  searchDocuments,
  getTopics,
};
