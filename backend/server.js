require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./database");

const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const requestRoutes = require("./routes/requests");
const adminRoutes = require("./routes/admin");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Allow small food images to be sent as Base64 data
app.use(express.json({ limit: "5mb" }));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FeedForward Backend is running successfully!"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FeedForward server running on http://localhost:${PORT}`);
});
