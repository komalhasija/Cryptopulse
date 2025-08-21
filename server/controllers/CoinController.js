import CoinHistory from "../models/CoinHistory.js";
import fetch from "node-fetch";

// Fetch current coin data from CoinGecko free endpoint
export const getCoinData = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { currency = "usd" } = req.query;

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: "CoinGecko API error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch historical data stored in MongoDB
export const getCoinHistory = async (req, res) => {
  try {
    const { coinId } = req.params;
    const { timeframe = "7D" } = req.query;

    const entry = await CoinHistory.findOne({ coinId, timeframe });
    if (!entry) {
      return res.status(404).json({ error: "No historical data found" });
    }

    res.json(entry.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
