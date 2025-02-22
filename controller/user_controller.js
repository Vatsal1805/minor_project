const User = require("../models/user_schema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyOtp } = require("../utils/otpGenerator.js");

// // Register a new user
// exports.registerUser = async (req, res) => {
//     try {
//         const { name, email, phone, password } = req.body;
//         const existingUser = await User.findOne({ phone });
//         if (existingUser) return res.status(400).json({ message: "User already exists" });

//         const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
//         const user = new User({ name, email, phone, password: hashedPassword, role: "User" });

//         await user.save();

//         // ✅ Generate token after registration
//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

//         res.status(201).json({ message: "User registered successfully", token, user });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Login user
// exports.loginUser = async (req, res) => {
//     try {
//         const { phone, password } = req.body;
//         const user = await User.findOne({ phone });

//         if (!user) return res.status(400).json({ message: "User not found" });

//         if (user.password) {
//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
//         }

//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
//         res.json({ message: "Login successful", token, user });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existingUser = await User.findOne({ phone });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const user = new User({ name, email, phone, password: hashedPassword, role: "User" });

        await user.save();

        // // ✅ Generate token after registration
        // const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // // Set token in a cookie
        // res.cookie("token", token, {
        //     httpOnly: true, // Cookie can't be accessed via JavaScript
        //     secure: process.env.NODE_ENV === "production", // Send cookie only over HTTPS in production
        //     sameSite: "Strict", // Prevents CSRF
        //     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set expiration to 7 days
        // });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;
        const user = await User.findOne({ phone });

        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id ,role: "User" }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Set cookie
        res.cookie("usertoken", token, {
            httpOnly: true,   // Prevents client-side JavaScript access
            secure: process.env.NODE_ENV === "production", // Set secure flag in production
            sameSite: "Strict", // Prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie expires in 7 days
        });

        res.json({ message: "Login successful", token, user });
        console.log("Login successful", token, user);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate("pastBookings");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email, address, profileImage } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        user.profileImage = profileImage || user.profileImage;

        await user.save();
        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.password) {
            return res.status(400).json({ message: "You cannot change password for OTP login" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change user phone number (with OTP verification)
exports.changePhoneNumber = async (req, res) => {
    try {
        const { newPhone, otp } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        const isOtpValid = await verifyOtp(newPhone, otp);
        if (!isOtpValid) return res.status(400).json({ message: "Invalid OTP" });

        const existingUser = await User.findOne({ phone: newPhone });
        if (existingUser) return res.status(400).json({ message: "Phone number already registered" });

        user.phone = newPhone;
        await user.save();

        res.json({ message: "Phone number updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
