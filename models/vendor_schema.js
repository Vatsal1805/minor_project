const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String },
    category: { type: String, required: true }, // Plumber, Electrician, etc.
    experience: { type: Number, default: 0 }, // Years of experience
    bio: { type: String }, // Provider description
    profileImage: { type: String },
    servicesOffered: [{
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" }, // Refers to admin-created service
        //customPrice: { type: Number }, // Provider can set a price if allowed
        status: { type: String, enum: ["Pending", "Approved", "Rejected","Suspended"], default: "Pending" } // Admin approval status
    }], // List of services provider applied for
    portfolioImages: [{ type: String }],
    ratings: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    payoutRequests: [{
        amount: Number,
        status: { type: String, enum: ["Pending", "Completed", "Rejected"], default: "Pending" },
        requestedAt: { type: Date, default: Date.now }
    }],
    verificationStatus: { type: String, enum: ["Pending", "Verified", "Rejected","Suspended"], default: "Pending" },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true }
    },
    createdAt: { type: Date, default: Date.now }
});


providerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ServiceProvider", providerSchema);
