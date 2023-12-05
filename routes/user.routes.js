const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const fileUploader = require("../config/cloudinary.config");
router.get("/:userId", async (req, res) => {
  try {
    console.log("1");
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log("@@@@@@@", user);
    res.json(user);
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
router.post(
  "/update-profile-image/:userId",
  fileUploader.single("photo"),
  async (req, res) => {
    const userId = req.params.userId;
    console.log("this is the IDDDDDDD", userId);
    try {
      // Assuming you have a 'profileImage' field in your User model to store the Cloudinary image URL
      await User.findByIdAndUpdate(
        userId,
        {
          photo: req.file ? req.file.path : null, // Check if req.file is defined
        },
        { new: true },
        { new: true }
      );

      res.status(200).json({ message: "Profile image updated successfully" });
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
