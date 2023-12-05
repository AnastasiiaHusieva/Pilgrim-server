const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");
const Post = require("../models/Post.model");
const City = require("../models/City.model");
const fileUploader = require("../config/cloudinary.config");

router.use(isAuthenticated);

router.get("/:cityId", async (req, res) => {
  const cityId = req.params.cityId;
  console.log("Received CityId:", cityId);
  try {
    const city = await City.findById(cityId);

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }
    const posts = await Post.find({ _id: { $in: city.posts } })
      .populate("likes")
      .populate("user");

    res.json({ city, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:cityId", fileUploader.single("photo"), async (req, res) => {
  const { cityId } = req.params;
  const { caption, user } = req.body;
  console.log("Received CityId:", cityId);

  try {
    const city = await City.findById(cityId);
    console.log("City:", city);
    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    const newPost = new Post({
      caption,
      photo: req.file.path,
      user,
      city: cityId,
    });
    await newPost.save();

    city.posts.push(newPost._id);
    await city.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/cities/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("Received userId:", userId);
  try {
    const post = await Post.find({ user: userId })
      .populate("city")
      .populate("comments")
      .populate("user");

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    // const posts = await Post.find({ _id: { $in: city.posts } }).populate('likes').populate('user');

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
