const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    // Ensure token can be taken from cookies or headers
    const token = req.cookies?.adminToken || req.cookies?.providerToken || req.cookies?.userToken || req.headers['authorization']?.split(' ')[1];

    console.log("Cookies:", req.cookies); // Debugging line
    console.log("Headers:", req.headers); // Debugging line
    console.log("Token:", token); // Debugging line

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; //Attach user ID & role to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

// Allow only Admins
exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

// Allow only Providers
exports.isProvider = (req, res, next) => {
    if (!req.user || req.user.role !== "Provider") {
        return res.status(403).json({ message: "Access denied. Providers only." });
    }
    next();
};

// Allow only Users
exports.isUser = (req, res, next) => {
    if (!req.user || req.user.role !== "User") {
        return res.status(403).json({ message: "Access denied. Users only." });
    }
    next();
};
