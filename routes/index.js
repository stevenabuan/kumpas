const express = require("express");
const router = express.Router();
const Artwork = require("../models/artwork");

router.get("/", async (req, res) => {
  let artworks;
  try {
    artworks = await Artwork.find()
      .sort({ createdAt: "desc" })
      .limit(10)
      .exec();
  } catch {
    artworks = [];
  }
  res.render("index", { artworks });
});

module.exports = router;
