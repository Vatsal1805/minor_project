const express = require("express");
const router = express.Router();
const adminController = require("../controller/admin_controller.js");
const { authMiddleware, isAdmin } = require("../middlewares/authmiddleware.js");

// ✅ Admin Authentication Routes
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.adminLogin);

// ✅ Admin Dashboard
router.get("/dashboard", authMiddleware, isAdmin, adminController.getDashboard);

// ✅ Provider Management
router.put("/approve-provider/:id", authMiddleware, isAdmin, adminController.approveProvider);
router.put("/reject-provider/:id", authMiddleware, isAdmin, adminController.rejectProvider);
router.put("/suspend-provider/:id", authMiddleware, isAdmin, adminController.suspendProvider);
router.put("/approve-provider-service", authMiddleware, isAdmin, adminController.approveProviderService);
router.put("/reject-provider-service", authMiddleware, isAdmin, adminController.rejectProviderService);
router.get("/providers", authMiddleware, isAdmin, adminController.getAllProviders);

// ✅ Booking Management
router.get("/bookings", authMiddleware, isAdmin, adminController.getAllBookings);

// ✅ Review Management
router.delete("/reviews/:id", authMiddleware, isAdmin, adminController.deleteReview);

module.exports = router;
