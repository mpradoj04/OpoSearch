const searchService = require("../services/SearchService");

const search = async (req, res) => {
  try {
    const { q, force, topic, page = 1, limit = 10, sort = "relevance" } = req.query;

    if (!q && !force && !topic) {
      return res.status(400).json({
        error: "At least one search parameter is required: 'q', 'force' or 'topic'.",
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res
        .status(400)
        .json({ error: "The 'page' parameter must be a positive integer." });
    }
    if (isNaN(limitNum) || limitNum < 1) {
      return res
        .status(400)
        .json({ error: "The 'limit' parameter must be a positive integer." });
    }

    if (Array.isArray(force)) {
      return res
        .status(400)
        .json({ error: "Only one 'force' can be filtered at a time." });
    }

    if (force && force !== "guardia_civil" && force !== "policia_nacional") {
      return res.status(400).json({
        error:
          "The 'force' parameter must be either 'guardia_civil' or 'policia_nacional'.",
      });
    }

    if (topic && isNaN(parseInt(topic, 10))) {
      return res.status(400).json({
        error: "The 'topic' parameter must be a number.",
      });
    }

    if (!["relevance", "name_asc", "name_desc"].includes(sort)) {
      return res.status(400).json({
        error: "The 'sort' parameter must be: relevance, name_asc, name_desc.",
      });
    }

    const { total, documents, totalPages } =
      await searchService.searchDocuments(q, force, topic, pageNum, limitNum, sort);

    return res.status(200).json({
      totalResultados: total,
      paginaActual: pageNum,
      totalPaginas: totalPages,
      documentos: documents,
    });
  } catch (error) {
    console.error("Error searching documents:", error);
    return res
      .status(500)
      .json({ error: "Internal error while executing the search" });
  }
};

module.exports = {
  search,
};
