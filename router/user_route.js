const express = require("express");
const router = express.Router();
const userController = require("../controller/user_controller.js");
const { authMiddleware, isAdmin } = require("../middlewares/authmiddleware.js");
const { validateUserRegistration } = require("../middlewares/validateRequest");

// Register a new user
router.post("/register", validateUserRegistration, userController.registerUser);

// Login user
router.post("/login", userController.loginUser);

// Get user profile (protected)
router.get("/profile", authMiddleware, userController.getUserProfile);

// Update user profile (protected)
router.put("/profile", authMiddleware, userController.updateUserProfile);

// Change password (protected)
router.put("/change-password", authMiddleware, userController.changePassword);

// Change phone number with OTP verification (protected)
router.put("/change-phone", authMiddleware, userController.changePhoneNumber);

// Get all users (Admin only)
router.get("/all", authMiddleware, isAdmin, userController.getAllUsers);

// Delete a user (Admin only)
router.delete("/:id", authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
