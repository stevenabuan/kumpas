if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");

app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: false }));

const indexRouter = require("./routes/index");
const artistRouter = require("./routes/artists");
const artworkRouter = require("./routes/artworks");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/artists", artistRouter);
app.use("/artworks", artworkRouter);

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => {
  console.error(error);
});
db.once("open", () => {
  console.log("Connected to Mongoose");
});

app.listen(process.env.PORT || 3000);
