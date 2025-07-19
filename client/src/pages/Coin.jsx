import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CoinContext } from "../context/CoinContext";
import { ThemeContext } from "../context/ThemeContext";
import LineChart from "../components/LineChart";
import { Moon, Sun } from "lucide-react";

const Coin = () => {
  const { coinId } = useParams(); // e.g., 'bitcoin'
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);

  const { allCoin, currency } = useContext(CoinContext);
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  const fetchCoinData = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`
      );
      const data = await res.json();
      setCoinData(data);
    } catch (err) {
      console.error("Error fetching coin data:", err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=30&interval=daily`
      );
      const data = await res.json();

      const prices = data.prices.map(([time, price]) => [
        time,
        parseFloat(price),
      ]);
      setHistoricalData({ prices });
    } catch (err) {
      console.error("Error fetching historical data:", err);
    }
  };

  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [coinId, currency]);

  // Inject WebSocket live price if available in allCoin
  useEffect(() => {
    if (!coinData) return;

    const liveCoin = allCoin.find((c) => c.id === coinId);
    if (liveCoin && liveCoin.current_price) {
      setCoinData((prev) => ({
        ...prev,
        market_data: {
          ...prev.market_data,
          current_price: {
            ...prev.market_data.current_price,
            [currency.name]: liveCoin.current_price,
          },
        },
      }));
    }
  }, [allCoin, coinData, coinId, currency.name]);

  if (!coinData || !historicalData) {
    return (
      <div
        className={`grid place-items-center min-h-[80vh] ${theme.bg} ${theme.text}`}
      >
        <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  const marketData = coinData.market_data;

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen px-5 py-5`}>
      {/* Theme Toggle */}
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
        {/* Chart */}
        <div className="h-64">
          <LineChart historicalData={historicalData} currency={currency.name} />
        </div>

        {/* Stats */}
        <div className="space-y-4 m-5">
          {[
            ["Crypto Market Rank", `#${coinData.market_cap_rank}`],
            [
              "Current Price",
              `${currency.symbol} ${marketData.current_price[currency.name].toLocaleString()}`,
            ],
            [
              "Market Cap",
              `${currency.symbol} ${marketData.market_cap[currency.name]?.toLocaleString()}`,
            ],
            [
              "24 Hour Volume",
              `${currency.symbol} ${marketData.total_volume[currency.name]?.toLocaleString()}`,
            ],
            [
              "Change (24H)",
              `${marketData.price_change_percentage_24h_in_currency[currency.name]?.toFixed(2)}%`,
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
