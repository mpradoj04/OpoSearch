require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { loadDocuments } = require("./services/loadService");
const {
  indexDocumentsFromMongo,
  deleteIndex,
} = require("./services/indexService");
const userRoutes = require("./routes/userRoutes");
const connectDB = require("./config/db");
const { isAuthenticated, isAdmin } = require("./middlewares/AuthMiddleware");

connectDB();

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("🚀 OpoSearch API funcionando");
});

app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
});

app.post("/load-documents", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const response = await loadDocuments();
    res.status(200).send(response.message);
  } catch (error) {
    console.error("Error al cargar documentos:", error);
    res.status(500).send("Error al cargar documentos");
  }
});

app.put("/index-documents", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const response = await indexDocumentsFromMongo();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error al indexar documentos:", error);
    res.status(500).json({ error: "Error al indexar documentos" });
  }
});

app.delete("/index-documents", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const response = await deleteIndex();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error al borrar el índice:", error);
    res.status(500).json({ error: "Error al borrar el índice" });
  }
});
