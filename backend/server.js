// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const videoRoutes = require("./routes/videoRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const parentRoutes = require("./routes/parentRoutes");
const userRoutes = require("./routes/userRoutes");
const classUpdatesRouter = require('./routes/classUpdates');

const app = express();

/* ======================================================
   CORS CONFIGURATION (IMPORTANT FOR RENDER DEPLOYMENT)
====================================================== */

const allowedOrigins = [
  "http://localhost:5173",                       // local dev
  process.env.FRONTEND_URL                       // Render frontend URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

/* ======================================================
   MIDDLEWARE
====================================================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❗ If uploads removed, DELETE this line entirely
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   HEALTH CHECK FOR RENDER
====================================================== */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend running…" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is healthy" });
});

/* ======================================================
   API ROUTES
====================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/users", userRoutes);
app.use('/api/class-updates', classUpdatesRouter);

/* ======================================================
   START SERVER
====================================================== */

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
