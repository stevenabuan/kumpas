const express = require("express");
const router = express.Router();
const Artwork = require("../models/artwork");
const Artist = require("../models/artist");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

// All Artworks Route
router.get("/", async (req, res) => {
  let query = Artwork.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const artworks = await query.exec();
    res.render("artworks/index", {
      artworks: artworks,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

// new artwork route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Artwork());
});

//create artwork route
router.post("/", async (req, res) => {
  const artwork = new Artwork({
    title: req.body.title,
    artist: req.body.artist,
    publishDate: new Date(req.body.publishDate),
    description: req.body.description,
  });

  saveArtwork(artwork, req.body.artworkImage);

  try {
    const newArtwork = await artwork.save();
    // res.redirect(`artworks/${newArtwork.id}`);
    res.redirect("artworks");
  } catch {
    renderNewPage(res, artwork, true);
  }
});

async function renderNewPage(res, artwork, hasError = false) {
  try {
    const artists = await Artist.find({});
    const params = {
      artists: artists,
      artwork: artwork,
    };
    if (hasError) params.errorMessage = "Error creating artwork";
    res.render("artworks/new", params);
  } catch {
    res.redirect("/artworks");
  }
}

function saveArtwork(artwork, artworkEncoded) {
  if (artworkEncoded == null) return;
  const artworkImage = JSON.parse(artworkEncoded);
  if (artworkImage != null && imageMimeTypes.includes(artworkImage.type)) {
    artwork.artworkImg = new Buffer.from(artworkImage.data, "base64");
    artwork.artworkImgType = artworkImage.type;
  }
}

module.exports = router;
