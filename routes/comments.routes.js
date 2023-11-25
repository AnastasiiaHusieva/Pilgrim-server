const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");

router.post("/add", async (req, res) => {
  const { userId, content, postId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await Comment.create({
      user: userId,
      post: postId,
      content: content,
    });
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.content = content;

    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
