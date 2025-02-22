const express = require("express");
const router = express.Router();
const providerController = require("../controller/vendor_controller.js");
const { authMiddleware, isProvider } = require("../middlewares/authmiddleware.js");
const { validateUserRegistration } = require("../middlewares/validateRequest");

// Register a new service provider
router.post("/register", validateUserRegistration, providerController.registerProvider);

// Login service provider
router.post("/login", providerController.loginProvider);

// Get provider profile (protected)
router.get("/profile", authMiddleware, isProvider, providerController.getProviderProfile);

// Get provider by ID
router.get("/:id", providerController.getProviderById); 


// Update provider profile (protected)
router.put("/profile", authMiddleware, isProvider, providerController.updateProviderProfile);

// Apply for a service (protected)
router.post("/apply-service", authMiddleware, isProvider, providerController.applyForService);

// Get providers offering a specific service
router.get("/", providerController.getProvidersByService); 


// Get provider earnings & payouts (protected)
router.get("/earnings", authMiddleware, isProvider, providerController.getProviderEarnings);

module.exports = router;
