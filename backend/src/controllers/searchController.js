const searchService = require("../services/searchService");

const search = async (req, res) => {
  try {
    const { q, force, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: "The 'q' parameter is required." });
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

    const { total, documents, totalPages } =
      await searchService.searchDocuments(q, force, pageNum, limitNum);

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
