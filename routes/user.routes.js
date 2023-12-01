const express = require("express");
const router = express.Router();
const User = require("../models/User.model");

router.get("/:userId", async (req, res) => {
  try {
    console.log("1");
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log("@@@@@@@", user);
    res.json({ name: user.name, email: user.email });
  } catch (error) {
    console.log("Error fetching userdata:", error);
    res.status(500).json({ error: "Internal Server error" });
  }
});

router.get("/", (req, res) => {
  User.find()

    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "internal error" });
    });
});

module.exports = router;
