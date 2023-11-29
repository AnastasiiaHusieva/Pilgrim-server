const express = require("express");
const router = express.Router();
const { isAuthenticated } = require('../middleware/jwt.middleware')
const Post = require("../models/Post.model");
const City = require("../models/City.model");

router.use(isAuthenticated);

router.get("/:cityId", async (req, res) => {
  const cityId = req.params.cityId;
  console.log('Received CityId:', cityId); 
  try {
    const city = await City.findById(cityId);

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    const posts = await Post.find({ _id: { $in: city.posts } }).populate('user');

    res.json({ city, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:cityId", async (req, res) => {
  const { cityId } = req.params;
  const { caption, photo, user } = req.body;
  console.log('Received CityId:', cityId); 

  try {
    const city = await City.findById(cityId);
    console.log('City:', city);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const newPost = new Post({
      caption,
      photo,
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

module.exports = router;
