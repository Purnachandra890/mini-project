const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models/schema");
const userAuth = require("../middlewares/authMiddlewares");

const router = express.Router();

// @route   GET /profile
// @desc    Get user profile (protected)
// @access  Private
router.get("/", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("username email tokens"); // ✅ fix

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "Profile fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tokens: user.tokens, // ✅ fetch from DB not from decoded token
      },
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});


// @route   POST /profile/change-password
// @desc    Change user password
// @access  Private
router.post("/change-password", userAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both current and new passwords are required." });
  }

  try {
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ message: "Server error while changing password." });
  }
});

module.exports = router;
