const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const resultRoutes = require("./routes/results");
const admitCardRoutes = require("./routes/admitCards");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/sarkari_results", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admit-cards", admitCardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ 
    message: "Sarkari Results API is running", 
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      jobs: "/api/jobs",
      results: "/api/results",
      admitCards: "/api/admit-cards",
      users: "/api/users",
      admin: "/api/admin"
    }
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});