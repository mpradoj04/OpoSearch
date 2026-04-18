require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { loadDocuments } = require("./backend/src/services/loadService");

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
