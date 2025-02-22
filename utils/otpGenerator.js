const otpStorage = new Map();

// Generate OTP
exports.generateOtp = (phone) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Expires in 5 mins
    return otp;
};

// Verify OTP
exports.verifyOtp = (phone, otp) => {
    const storedOtp = otpStorage.get(phone);
    if (!storedOtp || storedOtp.expiresAt < Date.now() || storedOtp.otp !== otp) {
        return false;
    }
    otpStorage.delete(phone);
    return true;
};
