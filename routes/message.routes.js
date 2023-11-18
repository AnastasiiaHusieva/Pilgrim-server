const express = require("express");
const router = express.Router();
const Message = require("../models/Message.model.js");

router.get("/", (req, res, next) => {
  Message.find().then((message) => {
    res.json(message);
  });
});
router.post("/", (req, res, next) => {
  const messageId = req.params;
  const { senderId, recipientId, message, isRead, createdAt } = req.body;
  Message.create({ senderId, recipientId, message, isRead, createdAt }).then(
    (data) => {
      res.json(data);
    }
  );
});

module.exports = router;
