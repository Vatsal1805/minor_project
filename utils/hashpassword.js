const bcrypt = require("bcryptjs");

// Hash Password
exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Compare Password
exports.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
