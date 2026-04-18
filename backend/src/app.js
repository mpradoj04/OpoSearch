require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { loadDocuments } = require("./services/loadService");
const {
  indexDocumentsFromMongo,
  deleteIndex,
} = require("./services/indexService");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 OpoSearch API funcionando");
});

app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
});

app.post("/load-documents", async (req, res) => {
  try {
    const response = await loadDocuments();
    res.status(200).send(response.message);
  } catch (error) {
    console.error("Error al cargar documentos:", error);
    res.status(500).send("Error al cargar documentos");
  }
});

app.put("/index-documents", async (req, res) => {
  try {
    const response = await indexDocumentsFromMongo();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error al indexar documentos:", error);
    res.status(500).json({ error: "Error al indexar documentos" });
  }
});

app.delete("/index-documents", async (req, res) => {
  try {
    const response = await deleteIndex();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error al borrar el índice:", error);
    res.status(500).json({ error: "Error al borrar el índice" });
  }
});
