const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment.model");
const Post = require("../models/Post.model");

router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ post: postId }).populate('user');

    if (!comments) {
      return res.status(404).json({ error: 'City not found' });
    }
    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/add", async (req, res) => {
  const { userId, content, postId } = req.body;
  try {
    if (!userId || !content || !postId) {
      return res.status(400).json({ error: "Missing required data" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = await Comment.create({
      user: userId,
      post: postId,
      content: content,
      isRead: false,
    });
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:commentId", async (req, res) => {
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

router.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const postId = comment.post;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments = post.comments.filter(comment => comment.toString() !== commentId);
    await post.save();

    await Comment.findByIdAndDelete(commentId);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
