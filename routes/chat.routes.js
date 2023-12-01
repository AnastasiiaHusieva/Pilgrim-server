const express = require("express");
const router = express.Router();

const User = require("../models/User.model");
const Chat = require("../models/Chat.model");

router.get("/:currentUserId", async (req, res) => {
  try {
    const senderId = req.params.currentUserId;
    console.log("##########", senderId);
    const chat = await Chat.find({ senderId: senderId }).populate("messages");
    if (!chat) {
      return res.status(404).json({ error: "chat not found" });
    }
    console.log("!!!!!!!!!!!!!!!!", chat);
    res.json(chat);
  } catch (error) {
    console.log("Error fetching userdata:", error);
    res.status(500).json({ error: "Internal Server error" });
  }
});
router.get("/recipient/:recipientId", async (req, res) => {
  try {
    const recipientId = req.params.recipientId;
    console.log("backend", recipientId);
    const recipientChat = await Chat.find({
      recipientId: recipientId,
    }).populate("messages");
    if (!recipientChat) {
      return res.status(404).json({ error: "chat not found" });
    }
    console.log("backend 2", recipientChat);
    res.json(recipientChat);
  } catch (error) {
    console.log("Error fetching userdata:", error);
    res.status(500).json({ error: "Internal Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const newChat = await Chat.create({ message });
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
