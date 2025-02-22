const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // Email (optional if using phone login)
    phone: { type: String, unique: true, required: true },
    password: { type: String }, // Only if email-password login is used
    profileImage: { type: String }, // User profile picture URL
    address: { type: String }, // Default address for bookings
    pastBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }], // Stores user's past bookings
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
