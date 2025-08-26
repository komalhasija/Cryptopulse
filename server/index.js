import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import favoriteRoutes from "./routes/favoriteRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes  from "./routes/authRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://cryptopulse-murex.vercel.app",
  "https://cryptopulse-1.onrender.com"
];

app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Optional: log incoming request origin for debugging
app.use((req, res, next) => {
  console.log("Incoming request origin:", req.headers.origin);
  next();
});

// Connect Database
connectDB();

// API routes
app.use("/api/favorites", favoriteRoutes);
app.use("/api/coins-report", reportRoutes);
app.use("/api/auth",authRoutes);

// Global error handler (CORS + other errors)
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Server Error" });
});



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
