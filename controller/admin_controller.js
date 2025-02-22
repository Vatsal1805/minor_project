const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin_schema.js");
const User = require("../models/user_schema.js");
const ServiceProvider = require("../models/vendor_schema.js");
const Booking = require("../models/booking_schema.js");
const Review = require("../models/review_schema.js");

// Register a new admin (Super Admin only)
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ name, email, password: hashedPassword, role: role || "Admin" });

        await admin.save();
        res.status(201).json({ message: "Admin registered successfully", admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin Login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { adminId: admin._id, role: "Admin" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("adminToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({ message: "Admin login successful", token, admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Admin Dashboard Stats
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProviders = await ServiceProvider.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: "Completed" });

        const totalRevenue = await Booking.aggregate([
            { $match: { status: "Completed" } },
            { $group: { _id: null, total: { $sum: "$price" } } },
        ]);

        res.json({
            totalUsers,
            totalProviders,
            totalBookings,
            completedBookings,
            totalRevenue: totalRevenue[0]?.total || 0,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
    }
};

// Approve a Service Provider
exports.approveProvider = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id);

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        provider.verificationStatus = "Verified";

        // Approve all provider services
        provider.servicesOffered.forEach(service => {
            service.status = "Approved";
        });

        await provider.save();

        res.json({ message: "Provider approved successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Reject a Provider (Newly Added)
exports.rejectProvider = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id);

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        provider.verificationStatus = "Rejected";

        await provider.save();

        res.json({ message: "Provider rejected successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Suspend a Provider
exports.suspendProvider = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id);

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        provider.verificationStatus = "Suspended";

        await provider.save();

        res.json({ message: "Provider suspended successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Service Providers
exports.getAllProviders = async (req, res) => {
    try {
        const providers = await ServiceProvider.find();
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.approveProviderService = async (req, res) => {
    try {
        const { providerId, serviceId } = req.body;

        // Find the provider
        const provider = await ServiceProvider.findById(providerId);
        if (!provider) return res.status(404).json({ message: "Provider not found" });

        // Find the requested service in provider's servicesOffered array
        const serviceIndex = provider.servicesOffered.findIndex(s => s.service.toString() === serviceId);
        if (serviceIndex === -1) {
            return res.status(404).json({ message: "Service request not found for this provider" });
        }

        // Approve the requested service
        provider.servicesOffered[serviceIndex].status = "Approved";
        await provider.save();

        res.json({ message: "Service approved successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Reject a requested service for a provider
exports.rejectProviderService = async (req, res) => {
    try {
        const { providerId, serviceId } = req.body;

        const provider = await ServiceProvider.findById(providerId);
        if (!provider) return res.status(404).json({ message: "Provider not found" });

        const serviceIndex = provider.servicesOffered.findIndex(s => s.service.toString() === serviceId);
        if (serviceIndex === -1) {
            return res.status(404).json({ message: "Service request not found for this provider" });
        }

        // Reject the requested service
        provider.servicesOffered[serviceIndex].status = "Rejected";
        await provider.save();

        res.json({ message: "Service rejected successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate("user provider service");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Review (Admin Moderation)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: "Review not found" });

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
