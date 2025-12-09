// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// ROUTES IMPORT
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const videoRoutes = require("./routes/videoRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const parentRoutes = require("./routes/parentRoutes");
const userRoutes = require("./routes/userRoutes");
const classUpdatesRouter = require("./routes/classUpdates");

const app = express();

/* =====================================================
   🔥 CORS — ALLOW ONLY LIVE FRONTEND + AUTH SUPPORT
===================================================== */
app.use(cors({
  origin: "https://css-sih.onrender.com",      // your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]   // REQUIRED for JWT
}));

/* =====================================================
   MIDDLEWARE
===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files if needed:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =====================================================
   HEALTH CHECK ROUTES
===================================================== */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend Live & Running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API Healthy" });
});

/* =====================================================
   API ROUTES
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/class-updates", classUpdatesRouter);

/* =====================================================
   CONNECT DB & START SERVER
===================================================== */
/* 🔍 TEST DATABASE CONNECTION */
app.get("/test-db", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ connected: true, collections });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend Running → https://backend-sih-nkv5.onrender.com`);
  });
});
