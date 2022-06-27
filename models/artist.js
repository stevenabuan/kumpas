const mongoose = require("mongoose");
const Artwork = require("./artwork");

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

artistSchema.pre("remove", function (next) {
  Artwork.find({ artist: this.id }, (err, artworks) => {
    if (err) {
      next(err);
    } else if (artworks.length > 0) {
      next(new Error("This artist still has an artwork!"));
    } else {
      next();
    }
  });
});

module.exports = mongoose.model("Artist", artistSchema);
