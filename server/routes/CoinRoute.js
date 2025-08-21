import express from "express";
import { getCoinData, getCoinHistory } from "../controllers/CoinController.js";

const router = express.Router();

// /api/coins/:coinId -> current coin data
router.get("/:coinId", getCoinData);

// /api/coins/:coinId/history?timeframe=7D -> historical data
router.get("/:coinId/history", getCoinHistory);

export default router;
