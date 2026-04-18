const searchService = require("../services/searchService");

const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "The 'q' parameter is required." });
    }

    const { total, documents } = await searchService.searchDocuments(q);

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
