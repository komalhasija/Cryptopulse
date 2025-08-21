import fetch from "node-fetch";
import cron from "node-cron";
import CoinHistory from "../models/CoinHistory.js";

const coins = ["bitcoin", "ethereum"];
const timeframes = { "1D": 1, "7D": 7, "1M": 30, "3M": 90, "1Y": 365 };

const fetchHistoricalData = async () => {
  for (let coinId of coins) {
    for (let [tf, days] of Object.entries(timeframes)) {
      try {
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
        const res = await fetch(url);
        const data = await res.json();

        await CoinHistory.findOneAndUpdate(
          { coinId, timeframe: tf },
          { data, updatedAt: new Date() },
          { upsert: true }
        );

        console.log(`✅ Updated ${coinId} ${tf}`);
      } catch (err) {
        console.error(`❌ Error updating ${coinId} ${tf}:`, err.message);
      }
    }
  }
};

// Run cron every 10 minutes
cron.schedule("*/10 * * * *", fetchHistoricalData);

export default fetchHistoricalData;
