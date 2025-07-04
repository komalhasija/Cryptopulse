import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CoinContext } from "../../Context/CoinContext";
import LineChart from "../../Components/LineChart/LineChart";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState();
  const { currency } = useContext(CoinContext);

  const fetchCoinData = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        {
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": "CG-ftn8r8Vk5dGYy2LPnT9sX9TM",
          },
        }
      );
      const data = await res.json();
      setCoinData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`,
        {
          headers: {
            accept: "application/json",
            "x-cg-demo-api-key": "CG-ftn8r8Vk5dGYy2LPnT9sX9TM",
          },
        }
      );
      const data = await res.json();
      setHistoricalData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [currency]);

  if (coinData && historicalData) {
    return (
      <div className="px-5 py-10">
        <div className="flex flex-col items-center gap-5 mb-12 mt-20">
          <img src={coinData.image.large} alt={coinData.name} className="w-24" />
          <p className="text-4xl font-medium">
            <b>{coinData.name} ({coinData.symbol.toUpperCase()})</b>
          </p>
        </div>

        <div className="max-w-xl mx-auto h-64">
          <LineChart historicalData={historicalData} />
        </div>

        <div className="max-w-xl mx-auto mt-12 space-y-4">
          {[
            ["Crypto Market Rank", coinData.market_cap_rank],
            ["Current Price", `${currency.symbol} ${coinData.market_data.current_price[currency.name].toLocaleString()}`],
            ["Market Cap", `${currency.symbol} ${coinData.market_data.market_cap[currency.name].toLocaleString()}`],
            ["24 Hour High", `${currency.symbol} ${coinData.market_data.high_24h[currency.name].toLocaleString()}`],
            ["24 Hour Low", `${currency.symbol} ${coinData.market_data.low_24h[currency.name].toLocaleString()}`]
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
  } else {
    return (
      <div className="grid place-items-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-700 rounded-full animate-spin"></div>
      </div>
    );
  }
};

export default Coin;
