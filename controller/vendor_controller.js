const ServiceProvider = require("../models/vendor_schema.js");
const Service = require("../models/service_schema.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new service provider
exports.registerProvider = async (req, res) => {
    try {
        const { name, email, phone, password, category, experience, bio, location,servicesOffered,profileImage } = req.body;

        const existingProvider = await ServiceProvider.findOne({ phone });
        if (existingProvider) return res.status(400).json({ message: "Provider already exists" });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const provider = new ServiceProvider({
            name, email, phone, password: hashedPassword, category, experience, bio, location,servicesOffered,profileImage, role: "Provider"
        });

        await provider.save();
        res.status(201).json({ message: "Provider registered successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login provider
exports.loginProvider = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const provider = await ServiceProvider.findOne({ phone });

        if (!provider) return res.status(400).json({ message: "Provider not found" });

        if (provider.password) {
            const isMatch = await bcrypt.compare(password, provider.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: provider._id, role: "Provider" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Store token in a role-based cookie
        res.cookie("providerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.json({ message: "Provider login successful", token, provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get provider profile
exports.getProviderProfile = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.user.userId).populate("servicesOffered.service");
        if (!provider) return res.status(404).json({ message: "Provider not found" });

        res.json(provider);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get proivder by id
exports.getProviderById = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id).populate("servicesOffered.service");

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }

        res.json(provider);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Update provider profile
exports.updateProviderProfile = async (req, res) => {
    try {
        const { name, email, bio, experience, profileImage, location } = req.body;
        const provider = await ServiceProvider.findById(req.user.userId);

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        provider.name = name || provider.name;
        provider.email = email || provider.email;
        provider.bio = bio || provider.bio;
        provider.experience = experience || provider.experience;
        provider.profileImage = profileImage || provider.profileImage;
        provider.location = location || provider.location;

        await provider.save();
        res.json({ message: "Profile updated successfully", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Apply for a service (Admin approval required)
exports.applyForService = async (req, res) => {
    try {
        const { serviceId } = req.body;
        const provider = await ServiceProvider.findById(req.user.userId);

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const existingService = provider.servicesOffered.find(s => s.service.toString() === serviceId);
        if (existingService) return res.status(400).json({ message: "Already applied for this service" });

        provider.servicesOffered.push({ service: serviceId, status: "Pending" });
        await provider.save();

        res.json({ message: "Applied for service. Waiting for admin approval.", provider });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProvidersByService = async (req, res) => {
    try {
        const { serviceId } = req.query;

        if (!serviceId) {
            return res.status(400).json({ message: "Service ID is required" });
        }

        // Find providers offering the given service
        const providers = await ServiceProvider.find({ 
            "servicesOffered.service": serviceId,
            "servicesOffered.status": "Approved" // Only approved providers
        }).populate("servicesOffered.service");

        if (providers.length === 0) {
            return res.status(404).json({ message: "No providers found for this service" });
        }

        res.json(providers);
        console.log(providers);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get provider earnings & payouts
exports.getProviderEarnings = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.user.userId);

        if (!provider) return res.status(404).json({ message: "Provider not found" });

        res.json({ earnings: provider.earnings, payoutRequests: provider.payoutRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
