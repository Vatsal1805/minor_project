const { body, validationResult } = require("express-validator");

// Validation rules for user registration
exports.validateUserRegistration = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("phone").isMobilePhone().withMessage("Invalid phone number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    },
];

// Validation rules for booking
exports.validateBooking = [
    body("service").notEmpty().withMessage("Service ID is required"),
    body("provider").notEmpty().withMessage("Provider ID is required"),
    body("date").isISO8601().withMessage("Invalid date format"),
    body("timeSlot").notEmpty().withMessage("Time slot is required"),
    body("address").notEmpty().withMessage("Address is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    },
];
