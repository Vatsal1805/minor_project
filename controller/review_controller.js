const Review = require("../models/review_schema");
const Booking = require("../models/booking_schema");
const ServiceProvider = require("../models/vendor_schema");

// Submit a review (User)
exports.submitReview = async (req, res) => {
    try {
        const { provider, service, rating, comment } = req.body;

        // Check if user has completed a booking with this provider
        const existingBooking = await Booking.findOne({ 
            user: req.user.userId, provider, service, status: "Completed" 
        });

        if (!existingBooking) {
            return res.status(400).json({ message: "You can only review completed bookings." });
        }

        // Create a new review
        const review = new Review({ 
            user: req.user.userId, provider, service, rating, comment 
        });

        await review.save();

        // Update provider's average rating
        const reviews = await Review.find({ provider });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await ServiceProvider.findByIdAndUpdate(provider, { ratings: avgRating });

        res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all reviews for a provider
exports.getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId }).populate("user service");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all reviews by a user
exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.userId }).populate("provider service");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a review (Admin only)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
