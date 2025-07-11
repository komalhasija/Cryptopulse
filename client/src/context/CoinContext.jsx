import { createContext, useEffect, useRef, useState } from "react";

export const CoinContext = createContext();

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$",
  });

  const ws = useRef(null);
  const ASSETS = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano", "litecoin", "xrp", "avalanche", "tron"];

  // Initial fetch to get static info about coins
  const fetchInitialData = async () => {
    try {
      const res = await fetch(
        `https://rest.coincap.io/v3/assets?apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`,
        
      );
      const data = await res.json();
      // Only pick required assets
      const filtered = data.data;
      console.log(filtered)
      setAllCoin(filtered);
    } catch (error) {
      console.error("Initial data fetch error:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Cleanup old socket if exists
    if (ws.current) ws.current.close();

    // Create WebSocket connection
    ws.current = new WebSocket(`wss://wss.coincap.io/prices?assets=${ASSETS.join(",")}&apiKey=57ba7d67d68d756cb4503d0321f5a1e3bb3fbfa1dcfeb5456eacf0cec39631e6`);

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      setAllCoin((prev) =>
      prev.map((coin) =>
        data[coin.id?.toLowerCase()] // normalize key
          ? { ...coin, priceUsd: data[coin.id.toLowerCase()] }
          : coin
      )
    );

      // setAllCoin((prev) =>
      //   prev.map((coin) =>
      //     data[coin.id]
      //       ? { ...coin, priceUsd: data[coin.id] }
      //       : coin
      //   )
      // );
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const contextValue = {
    allCoin,
    currency,
    setCurrency,
  };

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;
