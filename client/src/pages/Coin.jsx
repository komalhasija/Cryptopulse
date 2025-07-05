import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CoinContext } from "../context/CoinContext";
import LineChart from "../components/LineChart";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const { currency } = useContext(CoinContext);

  const fetchCoinData = async () => {
    try {
      const res = await fetch(`https://rest.coincap.io/v3/assets/${coinId}?apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`);
      const data = await res.json();
      setCoinData(data.data);
    } catch (err) {
      console.error("Error fetching coin data:", err);
    }
  };

  const fetchHistoricalData = async () => {
  try {
    const res = await fetch(
      `https://rest.coincap.io/v3/assets/${coinId}/history?interval=d1&apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`
    );
    const result = await res.json();

    // Format for chart: [timestamp, price]
    const prices = result.data.map(entry => [
      new Date(entry.time).getTime(),
      parseFloat(entry.priceUsd),
    ]);

    setHistoricalData({ prices }); // must be { prices: [...] }

  } catch (err) {
    console.error("Error fetching historical data:", err);
  }
};

  // Fetch on mount or currency change
  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [currency]);

  // WebSocket for live price
  useEffect(() => {
    const ws = new WebSocket(`wss://wss.coincap.io/prices?assets=${coinId}&apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`);

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data[coinId]) {
        setCoinData((prev) =>
          prev ? { ...prev, priceUsd: data[coinId] } : null
        );
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close(); // cleanup on unmount
  }, [coinId]);

  if (!coinData || !historicalData) {
    return (
      <div className="grid place-items-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-5 py-10">
      <div className="flex flex-col items-center gap-5 mb-12 mt-10">
        <img
           src={`https://rest.coincap.io/assets/icons/${coinData.symbol.toLowerCase()}@2x.png`}
           alt={coinData.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/fallback-icon.png";
          }}
          className="w-24 h-24"
        />
        <p className="text-4xl font-medium">
          <b>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </b>
        </p>
      </div>

      <div className="max-w-xl mx-auto h-64">
        <LineChart historicalData={historicalData} currency={currency.value} />
      </div>

      <div className="max-w-xl mx-auto mt-12 space-y-4">
        {[
          ["Crypto Market Rank", `#${coinData.rank}`],
          [
            "Current Price",
            `${currency.symbol} ${parseFloat(coinData.priceUsd).toFixed(2)}`,
          ],
          [
            "Market Cap",
            `${currency.symbol} ${parseFloat(
              coinData.marketCapUsd
            ).toLocaleString()}`,
          ],
          [
            "24 Hour Volume",
            `${currency.symbol} ${parseFloat(
              coinData.volumeUsd24Hr
            ).toLocaleString()}`,
          ],
          [
            "Change (24H)",
            `${parseFloat(coinData.changePercent24Hr).toFixed(2)}%`,
          ],
        ].map(([label, value], idx) => (
          <ul
            key={idx}
            className="flex justify-between border-b border-gray-600 py-2 text-sm sm:text-base"
          >
            <li>{label}</li>
            <li className="font-light">{value}</li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default Coin;
