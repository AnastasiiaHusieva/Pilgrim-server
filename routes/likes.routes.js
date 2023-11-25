const express = require("express");
const router = express.Router();
const Like = require("../models/Like.model");
const Post = require("../models/Post.model");

router.get("/", (req,res) => {
  res.send("heyyyy")
})
router.get('/:postId', async (req, res) => {  console.log('get likes');
  const { postId } = req.params;

  try {
    console.log('Fetching likes for postId:', postId);
    const likes = await Like.find({ post: postId }).populate('user');
    console.log('Likes:', likes);
    res.status(200).json(likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  try {
    if (!userId) {
      return res
        .status(400)
        .json({ error: "UserId is required in the request body" });
    }
    const existingLike = await Like.findOne({ user: userId, post: postId });

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      post.likes.pull(existingLike._id);
      await post.save();
      return res.status(200).json({ message: "Like removed successfully" });
    }
    const like = await Like.create({ user: userId, post: postId });
    post.likes.push(like._id);
    await post.save();

    res.status(201).json(like);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
