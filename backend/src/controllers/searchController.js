const searchService = require("../services/searchService");

const search = async (req, res) => {
  try {
    const { q, force } = req.query;
    if (!q) {
      return res.status(400).json({ error: "The 'q' parameter is required." });
    }

    if (Array.isArray(force)) {
      return res
        .status(400)
        .json({ error: "Only one 'force' can be filtered at a time." });
    }

    if (force && force !== "guardia_civil" && force !== "policia_nacional") {
      return res
        .status(400)
        .json({
          error:
            "The 'force' parameter must be either 'guardia_civil' or 'policia_nacional'.",
        });
    }

    const { total, documents } = await searchService.searchDocuments(q, force);

    return res.status(200).json({
      totalResultados: total,
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
