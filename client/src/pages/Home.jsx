import React, { useContext, useEffect, useState } from "react";
import { CoinContext } from "../context/CoinContext";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Download, Star, User, LogOut, Search, Menu, X } from "lucide-react";
import axios from "axios";

const Home = () => {
  const { allCoin, currency } = useContext(CoinContext);
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch favorites from backend
  useEffect(() => {
    if (user) {
      axios
        .get("https://cryptopulse-0kea.onrender.com/api/favorites", {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        .then((res) => setFavorites(res.data.map((fav) => fav.symbol.toLowerCase())))
        .catch((err) => console.error("Error fetching favorites", err));
    }
  }, [user]);

  // Setup displayCoin whenever allCoin or favorites change
  useEffect(() => {
    if (!allCoin.length) return;

    // Sort favorites to top if user is logged in
    const sorted = [...allCoin].sort((a, b) => {
      if (!user) return 0;
      
      const aIsFav = favorites.includes(a.symbol.toLowerCase());
      const bIsFav = favorites.includes(b.symbol.toLowerCase());
      return aIsFav === bIsFav ? 0 : aIsFav ? -1 : 1;
    });

    setDisplayCoin(sorted);
  }, [allCoin, favorites, user]);

  const inputHandler = (e) => {
    setInput(e.target.value);
    if (e.target.value === "") setDisplayCoin(allCoin);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    const filtered = allCoin.filter((coin) =>
      coin.name.toLowerCase().includes(input.toLowerCase())
    );
    setDisplayCoin(filtered);
  };

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(
        "https://cryptopulse-0kea.onrender.com/api/coins-report",
        { 
          responseType: "blob",
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = "crypto_report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(`Download failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFavClick = async (e, coin) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(
        "https://cryptopulse-0kea.onrender.com/api/favorites",
        {
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      if (res.data.status === "added") {
        setFavorites((prev) => [...prev, coin.symbol.toLowerCase()]);
      } else if (res.data.status === "removed") {
        setFavorites((prev) =>
          prev.filter((sym) => sym !== coin.symbol.toLowerCase())
        );
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setFavorites([]);
  };

  return (
    <div className={`${theme.bg} ${theme.text} min-h-screen`}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 bg-opacity-90 backdrop-blur-sm border-b border-gray-300">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-bold tracking-wide">CryptoPulse</h2>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Search */}
        <form onSubmit={searchHandler} className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search crypto..."
              value={input}
              onChange={inputHandler}
              className={`w-full pl-10 pr-4 py-2 rounded-md ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
          </div>
        </form>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:block w-72 ${theme.panel} p-6 space-y-6 border-r border-gray-300 sticky top-0 h-screen`}>
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
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-md text-white transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {loading ? "Processing..." : "Download Report"}
          </button>

          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md ${theme.button}`}
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            Toggle Theme
          </button>

          <div className="pt-4 border-t border-gray-300">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>Welcome, {user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-md text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md text-white text-center font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md text-white text-center font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className={`absolute right-0 top-0 h-full w-3/4 ${theme.panel} p-6 space-y-6 overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-md text-white transition disabled:opacity-50 w-full"
              >
                <Download className="w-4 h-4" />
                {loading ? "Processing..." : "Download Report"}
              </button>

              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md ${theme.button} w-full`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                Toggle Theme
              </button>

              <div className="pt-4 border-t border-gray-300">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      <span>Welcome, {user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 px-4 rounded-md text-white transition w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md text-white text-center font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md text-white text-center font-medium transition"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <main className={`flex-1 p-4 lg:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 ${theme.bg}`}>
          {displayCoin.slice(0, 20).map((coin) => {
            const isFav = favorites.includes(coin.symbol.toLowerCase());

            return (
              <Link
                to={`/coin/${coin.id}`}
                key={coin.id}
                className={`relative bg-gradient-to-br ${theme.card} rounded-2xl shadow-md p-5 hover:scale-105 hover:shadow-xl transition-transform duration-300`}
              >
                <button
                  onClick={(e) => handleFavClick(e, coin)}
                  disabled={loading}
                  className="absolute top-3 right-3 text-red-400 hover:text-yellow-500 disabled:opacity-50"
                  title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Star fill={isFav && user ? "currentColor" : "none"} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <img src={coin.image} alt={coin.name} className="w-12 h-12" />
                  <div>
                    <h3 className="text-lg font-semibold">{coin.name}</h3>
                    <span className={`text-sm ${theme.subtext}`}>
                      ({coin.symbol.toUpperCase()})
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-bold">
                    {currency.symbol} {coin.current_price?.toFixed(2)}
                  </p>
                  <p
                    className={`font-medium ${
                      coin.price_change_percentage_24h > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    24h: {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                  <p className={`text-sm ${theme.subtext}`}>
                    Market Cap: {currency.symbol}{" "}
                    {coin.market_cap?.toLocaleString()}
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