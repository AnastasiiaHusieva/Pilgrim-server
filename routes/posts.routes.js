const express = require("express");
const router = express.Router();
const Post = require("../models/Post.model");


router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user")
      .exec();
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user, caption, photo } = req.body;

    const post = await Post.create({ user, caption, photo });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
