import React, { useContext, useEffect, useState } from "react";
import { CoinContext } from "../context/CoinContext";
import { ImageContext } from "../context/ImageContext";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { Moon, Sun, Download, Star } from "lucide-react";
import axios from "axios";

const Home = () => {
  const { allCoin, currency } = useContext(CoinContext);
  const { images } = useContext(ImageContext);
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);

  const [favorites, setFavorites] = useState([]);
  const [combinedCoinData, setCombinedCoinData] = useState([]);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch favorites from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/favorites")
      .then((res) => setFavorites(res.data.map((fav) => fav.symbol)))
      .catch((err) => console.error("Error fetching favorites", err));
  }, []);

  // Merge CoinCap + CoinGecko data
  useEffect(() => {
    const merged = allCoin.map((coin) => {
      const matched = images.find(
        (img) => img.symbol.toLowerCase() === coin.symbol.toLowerCase()
      );
      return {
        ...coin,
        image: matched?.image || "/fallback-icon.png",
        price_change_percentage_24h:
          matched?.price_change_percentage_24h || coin.changePercent24Hr,
      };
    });

    // Sort so favorites come first
    const sorted = merged.sort((a, b) => {
      const aIsFav = favorites.includes(a.symbol);
      const bIsFav = favorites.includes(b.symbol);
      return aIsFav === bIsFav ? 0 : aIsFav ? -1 : 1;
    });

    setCombinedCoinData(sorted);
    setDisplayCoin(sorted);
  }, [allCoin, images, favorites]);

  const inputHandler = (e) => {
    setInput(e.target.value);
    if (e.target.value === "") setDisplayCoin(combinedCoinData);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    const filtered = combinedCoinData.filter((coin) =>
      coin.name.toLowerCase().includes(input.toLowerCase())
    );
    setDisplayCoin(filtered);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/coins-report", {
        responseType: "blob",
      });

      if (response.status !== 200) throw new Error("Download failed");

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "crypto_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen`}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`w-72 ${theme.panel} p-6 space-y-6 border-r border-gray-300 sticky top-0 h-screen`}>
          <h2 className="text-3xl font-bold tracking-wide">CryptoPulse</h2>

          <form onSubmit={searchHandler} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Search crypto..."
              value={input}
              onChange={inputHandler}
              className={`px-4 py-2 rounded-md ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 py-2 rounded-md text-white font-medium transition"
            >
              Search
            </button>
          </form>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-md text-white transition"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>

          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 py-2 px-4 rounded-md ${theme.button}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Toggle Theme
          </button>
        </aside>

        {/* Main Grid */}
        <main className={`flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${theme.bg}`}>
          {displayCoin.slice(0, 20).map((coin) => {
            const isFav = favorites.includes(coin.symbol);

            const handleFavClick = async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await axios.post("http://localhost:5000/api/favorites", {
                  symbol: coin.symbol,
                  name: coin.name,
                  image: coin.image,
                });
                setFavorites((prev) => [...prev, coin.symbol]);
              } catch (err) {
                console.error("Error adding to favorites:", err);
              } finally {
                setLoading(false);
              }
            };

            return (
              <Link
                to={`/coin/${coin.id}`}
                key={coin.id}
                className={`relative bg-gradient-to-br ${theme.card} rounded-2xl shadow-md p-5 hover:scale-105 hover:shadow-xl transition-transform duration-300`}
              >
                <button
                  onClick={handleFavClick}
                  className="absolute top-3 right-3 text-red-400 hover:text-yellow-500"
                  disabled={loading}
                  title={isFav ? "Favorited" : "Add to Favorites"}
                >
                  <Star fill={isFav ? "currentColor" : "none"} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <img src={coin.image} alt={coin.name} className="w-12 h-12" />
                  <div>
                    <h3 className="text-lg font-semibold">{coin.name}</h3>
                    <span className={`text-sm ${theme.subtext}`}>({coin.symbol.toUpperCase()})</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-bold">
                    {currency.symbol} {parseFloat(coin.priceUsd).toFixed(2)}
                  </p>
                  <p className={`font-medium ${coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}>
                    24h: {parseFloat(coin.price_change_percentage_24h).toFixed(2)}%
                  </p>
                  <p className={`text-sm ${theme.subtext}`}>
                    Market Cap: {currency.symbol} {parseFloat(coin.marketCapUsd).toLocaleString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default Home;
