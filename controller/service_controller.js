const Service = require("../models/service_schema.js");

// Create a new service (Admin only)
exports.createService = async (req, res) => {
    try {
        const { name, category, description, basePrice, duration, images } = req.body;

        // Convert name to lowercase for case-insensitive uniqueness check
        const existingService = await Service.findOne({ name: name.toLowerCase() });
        if (existingService) return res.status(400).json({ message: "Service already exists" });

        // Create new service
        const service = new Service({
            name: name.toLowerCase(),
            category,
            description,
            basePrice,
            duration,
            images,
            createdBy: req.user.userId
        });

        await service.save();
        res.status(201).json({ message: "Service created successfully", service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all services (Users & Providers)
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
    try {
        const { name, category, description, basePrice, duration, images } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) return res.status(404).json({ message: "Service not found" });

        // Ensure at least one field is being updated
        if (!name && !category && !description && !basePrice && !duration && !images) {
            return res.status(400).json({ message: "At least one field must be updated" });
        }

        service.name = name ? name.toLowerCase() : service.name;
        service.category = category || service.category;
        service.description = description || service.description;
        service.basePrice = basePrice || service.basePrice;
        service.duration = duration || service.duration;
        service.images = images || service.images;

        await service.save();
        res.json({ message: "Service updated successfully", service });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });

        res.json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
