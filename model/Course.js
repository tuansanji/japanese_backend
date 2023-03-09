const mongoose = require("mongoose");
require("dotenv").config();
const dungMoriConnect = mongoose.createConnection(
  process.env.MONGODB_URL_DUNGMORI
);
const courseSchema = new mongoose.Schema(
  {
    name: String,
    lesson: String,
    way: String,
    stage: String,
    level: String,
    author: String,
    pathVideo: String,
    pdf: String,
    audio: String,
    desc: String,
    thumb: String,
    timeLine: Number,
  },
  {
    collection: "N1",
    timestamps: true,
  }
);

module.exports = dungMoriConnect.model("course", courseSchema);
