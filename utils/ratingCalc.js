const Review = require("../models/Review");
const ServiceProvider = require("../models/ServiceProvider");

// Update Provider Rating
exports.updateProviderRating = async (providerId) => {
    const reviews = await Review.find({ provider: providerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await ServiceProvider.findByIdAndUpdate(providerId, { ratings: avgRating });
};
