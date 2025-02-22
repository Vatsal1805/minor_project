const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who booked the service
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, // Service being booked
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceProvider", required: true }, // Assigned provider
    date: { type: Date, required: true }, // Booking date
    timeSlot: { type: String, required: true }, // Time slot chosen by the user
    address: { type: String, required: true }, // Service location
    status: { 
        type: String, 
        enum: ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"], 
        default: "Pending" 
    }, // Booking status
    createdAt: { type: Date, default: Date.now } // Timestamp when the booking was made
});

module.exports = mongoose.model("Booking", bookingSchema);
