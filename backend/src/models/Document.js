const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    forces: [
      {
        type: String,
        enum: ["policia_nacional", "guardia_civil"],
      },
    ],
    topics: [
      {
        force: {
          type: String,
          enum: ["policia_nacional", "guardia_civil"],
        },
        number: {
          type: Number,
        },
        title: {
          type: String,
          trim: true,
        },
      },
    ],
    text: {
      type: String,
      required: true,
    },
    elasticsearchId: {
      type: String,
    },
    filePath: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Document", documentSchema);
