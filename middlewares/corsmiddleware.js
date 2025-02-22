const cors = require("cors");

exports.corsMiddleware = cors({
    origin: ["http://localhost:3000", "https://your-frontend.com"], // Allowed domains
    methods: ["GET", "POST", "PUT", "DELETE"],
});
