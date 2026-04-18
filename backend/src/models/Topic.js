const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    force: {
      type: String,
      required: true,
      enum: ["policia_nacional", "guardia_civil"],
    },
    block: {
      type: String,
      trim: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Topic", topicSchema);
