const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who wrote the review
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true }, // Provider being reviewed
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, // Service for which review was given
    rating: { type: Number, required: true, min: 1, max: 5 }, // Star rating (1 to 5)
    comment: { type: String, required: true }, // User feedback
    createdAt: { type: Date, default: Date.now } // Timestamp of review
});

module.exports = mongoose.model("Review", reviewSchema);
