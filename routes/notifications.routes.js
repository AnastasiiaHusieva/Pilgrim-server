const express = require("express");
const router = express.Router();
const Post = require("../models/Post.model");

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

    // Exclude notifications related to the logged-in user
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

router.post("/mark-notifications-as-read", async (req, res)=> {
  const { userId } = req.body;
  console.log(userId)
  try {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true })

    res.json({ message: 'Notifications marked as read successfully' })

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

module.exports = router;
