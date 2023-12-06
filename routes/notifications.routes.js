const express = require("express");
const router = express.Router();
const Post = require("../models/Post.model");
const Like = require("../models/Like.model");
const Comment = require("../models/Comment.model");
const mongoose = require('mongoose');

router.get("/:userId", async (req, res) => {
    const {userId}  = req.params;
  try {
    const posts = await Post.find({user: userId})
    .populate([
      {
        path: 'likes',
        populate: [
          {
            path: 'user',
          },
          {
            path: 'post',
          },
        ],
      },
      {
        path: 'comments',
        populate: [
          {
            path: 'user',
          },
          {
            path: 'post',
          },
        ],
      },
    ])
    .populate('user');

    let notifications = [];

    posts.forEach((post) => {
      const postAuthorId = post.user._id.toString();
      const likes = post.likes
        .filter((like) => like.user._id.toString() !== userId )
        .map((like) => ({
          ...like.toObject(),
          type: 'like',
          user: like.user.toObject(),
        }));
      const comments = post.comments
        .filter((comment) => comment.user._id.toString() !== userId )
        .map((comment) => ({
          ...comment.toObject(),
          type: 'comment',
          user: comment.user.toObject(),
          content: comment.content,
        }));

      notifications = [...notifications, ...likes, ...comments];
    });

    notifications = notifications.filter(
      (notification) => notification.user._id.toString() !== userId
    );

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/unread-notifications-count/:userId", async (req, res) => { 
  const { userId } = req.params;
  console.log("11111111",userId)

  try {
    const userPosts = await Post.find({ user: userId });
    console.log("User posts:", userPosts);

    const postIds = userPosts.map((post) => post._id);
    console.log("Post IDs:", postIds);
    const unreadLikesCount = await Like.countDocuments({
      post: { $in: postIds },
      user: { $ne: userId },
      isRead: false,
    });

    const unreadCommentsCount = await Comment.countDocuments({
      post: { $in: postIds },
      user: { $ne: userId }, 
      isRead: false,
    });
    console.log("Unread Likes Count:", unreadLikesCount);
    console.log("Unread Comments Count:", unreadCommentsCount);
    res.json({
      unreadLikesCount,
      unreadCommentsCount,
    });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post("/mark-notifications-as-read/:userId", async (req, res) => {
  const { userId } = req.params;


  try {
    const userPosts = await Post.find({user: userId})

    const postIds = userPosts.map(post => post._id);

    await Like.updateMany(
      { post: { $in: postIds }},
      { $set: { isRead: true } }
    );

    await Comment.updateMany(
      { post: { $in: postIds }},
      { $set: { isRead: true } }
    );

    res.json({ message: 'Notifications marked as read successfully' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
