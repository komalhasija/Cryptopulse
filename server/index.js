import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import coinRoutes from "./routes/CoinRoute.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import fetchHistoricalData from "./cron/fetchHistoricalData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://cryptopulse-1.onrender.com",
  "https://cryptopulse-murex.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/coins", coinRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/coins-report", reportRoutes);

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

// Start Cron job (fetch every 10 min)
fetchHistoricalData();
