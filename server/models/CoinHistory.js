import mongoose from "mongoose";

const coinSchema = new mongoose.Schema({
  coinId: String,
  timeframe: String,
  data: Object,
  updatedAt: { type: Date, default: Date.now },
});

const CoinHistory = mongoose.model("CoinHistory", coinSchema);

export default CoinHistory;
