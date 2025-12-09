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
   CORS — ALLOW ONLY LIVE FRONTEND
===================================================== */

app.use(cors({
  origin: "https://css-sih.onrender.com",  // LIVE FRONTEND ONLY
  credentials: true,
}));

/* =====================================================
   MIDDLEWARE
===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// If you allow uploads, keep this:
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
   API ROUTING
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/class-updates", classUpdatesRouter);

/* =====================================================
   START SERVER + CONNECT DATABASE
===================================================== */

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend Running → https://backend-sih-nkv5.onrender.com`);
  });
});
