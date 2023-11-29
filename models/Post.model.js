const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
  },
  photo: {
    type: String,
    required: true,
  },
  user: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  city:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
  createdAt:
    {
      type: Date,
      default: Date.now,
    },

});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
