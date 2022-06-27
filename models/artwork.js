const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  artworkImg: {
    type: Buffer,
    required: true,
  },
  artworkImgType: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Artist",
  },
});

artworkSchema.virtual("coverImagePath").get(function () {
  if (this.artworkImg != null && this.artworkImgType != null) {
    return `data:${
      this.artworkImgType
    };charset=utf-8;base64,${this.artworkImg.toString("base64")}`;
  }
});

module.exports = mongoose.model("Artwork", artworkSchema);
