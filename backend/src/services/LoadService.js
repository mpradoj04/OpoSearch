const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const Topic = require("../models/Topic");

const FOLDER_MAP = {
  guardia_civil: "Guardia Civil",
  policia_nacional: "Policía Nacional",
  ambos: "Ambos",
};

const DOCS_PATH = path.join(__dirname, "../../../docs");

async function buildMetadataMapAndTopics() {
  const metadataPath = path.join(DOCS_PATH, "metadata.json");
  if (!fs.existsSync(metadataPath)) {
    console.warn("Metadata file not found.");
    return { map: {}, topicDocs: {} };
  }

  const rawMeta = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const map = {};
  const topicDocs = { guardia_civil: {}, policia_nacional: {} };

  for (const force of ["guardia_civil", "policia_nacional"]) {
    for (const t of rawMeta[force] || []) {
      const topic = new Topic({
        number: t.number,
        title: t.title,
        force: force,
        block: t.block || "",
      });
      await topic.save();
      topicDocs[force][t.number] = topic;

      (t.documents || []).forEach((docName) => {
        map[docName] = map[docName] || { topics: [] };
        map[docName].topics.push({ force, number: t.number, title: t.title });
      });
    }
  }

  return { map, topicDocs };
}

async function processFile(
  filePath,
  fileName,
  forceKey,
  fileMetadata = {},
  topicDocs = {},
) {
  try {
    const extension = path.extname(fileName).toLowerCase();

    if (extension !== ".pdf") {
      console.log(`Ignored: ${fileName}`);
      return;
    }

    const data = await pdfParse(fs.readFileSync(filePath));
    const text = data.text;

    if (!text) {
      console.log(`Ignored: ${fileName}`);
      return;
    }

    const doc = await new Document({
      name: fileName.replace(extension, ""),
      forces:
        forceKey === "ambos"
          ? ["policia_nacional", "guardia_civil"]
          : [forceKey],
      topics: fileMetadata.topics || [],
      text: text.replace(/\r\n/g, "\n"),
      filePath: path
        .relative(path.join(__dirname, "../../../"), filePath)
        .replace(/\\/g, "/"),
    }).save();

    for (const t of fileMetadata.topics || []) {
      const topicDoc = topicDocs[t.force]?.[t.number];
      if (topicDoc) {
        topicDoc.documents.push(doc._id);
        await topicDoc.save();
      }
    }

    console.log(`File saved correctly: ${fileName}`);
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error.message);
  }
}

async function loadDocuments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Document.deleteMany({});
    await Topic.deleteMany({});
    console.log("Documents and Topics collections cleared.");

    const { map: metadataMap, topicDocs } = await buildMetadataMapAndTopics();

    for (const [forceKey, folderName] of Object.entries(FOLDER_MAP)) {
      const folderPath = path.join(DOCS_PATH, folderName);

      if (!fs.existsSync(folderPath)) {
        console.warn(`The folder does not exist: ${folderPath}`);
        continue;
      }

      for (const file of fs.readdirSync(folderPath)) {
        const fullPath = path.join(folderPath, file);
        if (fs.statSync(fullPath).isFile()) {
          await processFile(
            fullPath,
            file,
            forceKey,
            metadataMap[file],
            topicDocs,
          );
        }
      }
    }

    console.log("Documents import completed.");
    return { success: true, message: "Documents import completed." };
  } catch (err) {
    console.error("Error fatal:", err);
    throw err;
  }
}

module.exports = {
  loadDocuments,
  processFile,
};
