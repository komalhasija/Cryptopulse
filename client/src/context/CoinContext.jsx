import { createContext, useEffect, useRef, useState } from "react";

export const CoinContext = createContext();

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$",
  });

  const ws = useRef(null);

  // Binance symbols: map ids to binance pairs
  const ASSETS = [
    { id: "bitcoin", symbol: "btcusdt" },
    { id: "ethereum", symbol: "ethusdt" },
    { id: "solana", symbol: "solusdt" },
    { id: "dogecoin", symbol: "dogeusdt" },
    { id: "cardano", symbol: "adausdt" },
    { id: "litecoin", symbol: "ltcusdt" },
    { id: "xrp", symbol: "xrpusdt" },
    { id: "avalanche", symbol: "avaxusdt" },
    { id: "tron", symbol: "trxusdt" },
  ];

  // Fetch static metadata (can still use CoinCap or CoinGecko here)
  const fetchInitialData = async () => {
    try {
      const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false`
    );
 const data = await res.json();
      const filtered = data;
      setAllCoin(filtered);
    } catch (error) {
      console.error("Initial data fetch error:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Setup combined Binance WebSocket stream
    const streamNames = ASSETS.map((a) => `${a.symbol}@trade`).join("/");
    const socketUrl = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;

    ws.current = new WebSocket(socketUrl);

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const symbol = msg.data.s.toLowerCase(); // e.g., btcusdt
      const price = msg.data.p;

      const asset = ASSETS.find((a) => a.symbol === symbol);
      if (!asset) return;

      setAllCoin((prev) =>
        prev.map((coin) =>
          coin.id === asset.id
            ? { ...coin, current_price: parseFloat(price) }
            : coin
        )
      );
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

