const express = require("express");
const router = express.Router();
const bookingController = require("../controller/booking_controller.js");
const { authMiddleware, isUser, isProvider, isAdmin } = require("../middlewares/authmiddleware.js");

// Create a new booking (User only)
router.post("/create", authMiddleware, isUser, bookingController.createBooking);

// Get all bookings for a user (Protected)
router.get("/user", authMiddleware, isUser, bookingController.getUserBookings);

// Get all bookings for a provider (Protected)
router.get("/provider", authMiddleware, isProvider, bookingController.getProviderBookings);

// Update booking status (Provider only)
router.put("/update-status/:id", authMiddleware, isProvider, bookingController.updateBookingStatus);

// Get all bookings (Admin only)
router.get("/all", authMiddleware, isAdmin, bookingController.getAllBookings);

module.exports = router;
