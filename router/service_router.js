const express = require("express");
const router = express.Router();
const serviceController = require("../controller/service_controller.js");
const { authMiddleware, isAdmin } = require("../middlewares/authmiddleware.js");

// ✅ Create a new service (Admin only)
router.post("/create", authMiddleware, isAdmin, serviceController.createService);

// ✅ Get all services (Users & Providers)
router.get("/", serviceController.getAllServices);

// ✅ Get a single service by ID
router.get("/:id", serviceController.getServiceById);

// ✅ Update a service (Admin only)
router.put("/:id", authMiddleware, isAdmin, serviceController.updateService);

// ✅ Delete a service (Admin only)
router.delete("/:id", authMiddleware, isAdmin, serviceController.deleteService);

module.exports = router;
