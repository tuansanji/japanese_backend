const mongoose = require("mongoose");

const userGmailSchema = new mongoose.Schema(
  {
    username: String,
    id: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    thumb: {
      type: String,
      default:
        "https://scr.vn/wp-content/uploads/2020/07/Avatar-Facebook-tr%E1%BA%AFng.jpg",
    },
    money: {
      type: Number,
      default: 0,
    },
    courses: { type: Array, default: [] },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserGmail", userGmailSchema);
