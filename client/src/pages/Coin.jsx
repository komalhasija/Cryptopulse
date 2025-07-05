import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CoinContext } from "../context/CoinContext";
import { ThemeContext } from "../context/ThemeContext";
import LineChart from "../components/LineChart";
import { Moon, Sun } from "lucide-react";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const { currency } = useContext(CoinContext);

  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  const fetchCoinData = async () => {
    try {
      const res = await fetch(
        `https://rest.coincap.io/v3/assets/${coinId}?apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`
      );
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

      const prices = result.data.map((entry) => [
        new Date(entry.time).getTime(),
        parseFloat(entry.priceUsd),
      ]);

      setHistoricalData({ prices });
    } catch (err) {
      console.error("Error fetching historical data:", err);
    }
  };

  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [currency, coinId]);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://wss.coincap.io/prices?assets=${coinId}&apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`
    );

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

    return () => ws.close();
  }, [coinId]);

  if (!coinData || !historicalData) {
    return (
      <div
        className={`grid place-items-center min-h-[80vh] ${theme.bg} ${theme.text}`}
      >
        <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen px-5 py-5`}>
      {/* Theme toggle button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 py-2 px-4 rounded-md ${theme.button}`}
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4" /> Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" /> Dark Mode
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-5 mb-8 mt-5">
        <p className="text-4xl font-medium">
          <b>
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </b>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto py-10">
        {/* Left: Line Chart */}
        <div className="h-64">
          <LineChart historicalData={historicalData} currency={currency.name} />
        </div>

        {/* Right: Coin Stats */}
        <div className="space-y-4 m-5">
          {[
            ["Crypto Market Rank", `#${coinData.rank}`],
            [
              "Current Price",
              `${currency.symbol} ${parseFloat(coinData.priceUsd).toFixed(2)}`,
            ],
            [
              "Market Cap",
              `${currency.symbol} ${parseFloat(coinData.marketCapUsd).toLocaleString()}`,
            ],
            [
              "24 Hour Volume",
              `${currency.symbol} ${parseFloat(coinData.volumeUsd24Hr).toLocaleString()}`,
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
    </div>
  );
};

export default Coin;
