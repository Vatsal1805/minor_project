const express = require('express');
const cors = require("cors");
const http = require("http");  // Import http module
const socketIo = require("socket.io");
require('dotenv').config();
const cookieParser = require("cookie-parser");

const port = process.env.PORT;  
const dbconnect = require('./dbconfig/dbconfig.js');
dbconnect();

// Import Routes
const userRoutes = require("./router/user_route.js");
const providerRoutes = require("./router/vendor_route.js");
const adminRoutes = require("./router/admin_route.js");
const serviceRoutes = require("./router/service_router.js");
const bookingRoutes = require("./router/booking_router.js");
const reviewRoutes = require("./router/review_router.js");

// Initialize Express app

const app = express();
app.use(express.json());
app.use(cookieParser());

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize socket.io with the server
const io = socketIo(server, {
    cors: { origin: "*" } 
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("joinRoom", (userId) => {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.send("Home Utility Service API is Running...");
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
