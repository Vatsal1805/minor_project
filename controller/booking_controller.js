const Booking = require("../models/booking_schema");
const ServiceProvider = require("../models/vendor_schema");
const User = require("../models/user_schema");

// Create a new booking (User)
exports.createBooking = async (req, res) => {
    try {
        const { service, provider, date, timeSlot, address } = req.body;

        if (!req.user || req.user.role !== "User") {
            return res.status(403).json({ message: "Access denied. Users only." });
        }

        // Check if provider exists
        const providerExists = await ServiceProvider.findById(provider);
        if (!providerExists) {
            return res.status(404).json({ message: "Provider not found" });
        }

        // Create new booking
        const booking = new Booking({
            user: req.user.userId,
            service,
            provider,
            date,
            timeSlot,
            address,
            status: "Pending"
        });

        await booking.save();

        // Emit real-time event for new booking
        const io = req.app.get("io");
        io.to(provider.toString()).emit("newBooking", { message: "New booking created", booking });

        res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "User") {
            return res.status(403).json({ message: "Access denied. Users only." });
        }

        const bookings = await Booking.find({ user: req.user.userId }).populate("service provider");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all bookings for a provider
exports.getProviderBookings = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "Provider") {
            return res.status(403).json({ message: "Access denied. Providers only." });
        }

        const bookings = await Booking.find({ provider: req.user.userId }).populate("service user");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update booking status (Provider)
exports.updateBookingStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "Provider") {
            return res.status(403).json({ message: "Access denied. Providers only." });
        }

        const { status } = req.body;
        const booking = await Booking.findById(req.params.id).populate("user provider");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Allow only valid status transitions
        const validStatuses = ["Pending", "Accepted", "Completed", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid booking status" });
        }

        // Prevent duplicate status updates
        if (booking.status === status) {
            return res.status(400).json({ message: "Booking is already in this status" });
        }

        booking.status = status;
        await booking.save();

        // Emit real-time event only to the affected user
        const io = req.app.get("io");
        io.to(booking.user.toString()).emit("bookingUpdated", {
            bookingId: booking._id,
            status,
            message: `Booking status changed to ${status}`
        });

        res.json({ message: "Booking status updated successfully", booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin can view all bookings
exports.getAllBookings = async (req, res) => {
    try {
        if (!req.user || req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const bookings = await Booking.find().populate("user service provider");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
