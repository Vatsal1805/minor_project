const express = require("express");
const router = express.Router();
const reviewController = require("../controller/review_controller");
const { authMiddleware, isUser, isAdmin } = require("../middlewares/authmiddleware");

// ✅ Submit a review (User only)
router.post("/submit", authMiddleware, isUser, reviewController.submitReview);

// ✅ Get all reviews for a provider (Public)
router.get("/provider/:providerId", reviewController.getProviderReviews);

// ✅ Get all reviews by a user (User only)
router.get("/user", authMiddleware, isUser, reviewController.getUserReviews);

// ✅ Delete a review (Admin only)
router.delete("/:id", authMiddleware, isAdmin, reviewController.deleteReview);

module.exports = router;
