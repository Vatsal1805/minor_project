const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Service name (must be unique)
    category: { type: String, required: true }, // Service category (e.g., Plumbing, Electrical)
    description: { type: String }, // Service details
    basePrice: { type: Number, required: true }, // Standard price set by admin
    duration: { type: Number, required: true }, // Estimated service time in minutes
    images: [{ type: String }], // Service images
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Admin who created this service
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Service", serviceSchema);
