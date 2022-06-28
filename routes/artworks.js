const express = require("express");
const router = express.Router();
const Artwork = require("../models/artwork");
const Artist = require("../models/artist");
// const artwork = require("../models/artwork");
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
    res.redirect(`artworks/${newArtwork.id}`);
  } catch {
    renderNewPage(res, artwork, true);
  }
});

// Show Artwork Route
router.get("/:id", async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate("artist")
      .exec();
    res.render("artworks/show", { artwork: artwork });
  } catch {
    res.redirect("/");
  }
});

// Edit Artwork Route
router.get("/:id/edit", async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    renderEditPage(res, artwork);
  } catch {
    res.redirect("/");
  }
});

// Update Artwork Route
router.put("/:id", async (req, res) => {
  let artwork;
  try {
    artwork = await Artwork.findById(req.params.id);
    artwork.title = req.body.title;
    artwork.artist = req.body.artist;
    artwork.publishDate = new Date(req.body.publishDate);
    artwork.description = req.body.description;
    if (req.body.artworkImage != null && req.body.artworkImage !== "") {
      saveCover(artwork, req.body.artworkImage);
    }
    await artwork.save();
    res.redirect(`/artworks/${artwork.id}`);
  } catch {
    if (artwork != null) {
      renderEditPage(res, artwork, true);
    } else {
      redirect("/");
    }
  }
});

// Delete Artwork Page
router.delete("/:id", async (req, res) => {
  let artwork;
  try {
    artwork = await Artwork.findById(req.params.id);
    await artwork.remove();
    res.redirect("/artworks");
  } catch {
    if (artwork != null) {
      res.render("artworks/show", {
        artwork,
        errorMessage: "Could not remove artwork",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, artwork, hasError = false) {
  renderFormPage(res, artwork, "new", hasError);
}

async function renderEditPage(res, artwork, hasError = false) {
  renderFormPage(res, artwork, "edit", hasError);
}

async function renderFormPage(res, artwork, form, hasError = false) {
  try {
    const artists = await Artist.find({});
    const params = {
      artists,
      artwork,
    };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Artwork";
      } else {
        params.errorMessage = "Error Creating Artwork";
      }
    }
    res.render(`artworks/${form}`, params);
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
