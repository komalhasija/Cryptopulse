import React, { useContext, useEffect, useState, useRef } from "react";
import { CoinContext } from "../context/CoinContext";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import SearchComponent from "../components/Search";
import {
  Moon,
  Sun,
  Download,
  Star,
  User,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Wallet
} from "lucide-react";
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch favorites from backend
  useEffect(() => {
    if (user) {
      axios
        .get("https://cryptopulse-0kea.onrender.com/api/favorites", {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        .then((res) => setFavorites(res.data.map((fav) => fav.symbol.toLowerCase())))
        .catch((err) => console.error("Error fetching favorites", err));
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Setup displayCoin whenever allCoin or favorites change
  useEffect(() => {
    if (!allCoin.length) return;

    let filteredCoins = [...allCoin];

    // Apply search filter first
    if (searchQuery) {
      filteredCoins = filteredCoins.filter((coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Then apply tab filters
    if (activeTab === "gainers") {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h > 0);
    } else if (activeTab === "losers") {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h < 0);
    } else if (activeTab === "favorites" && user) {
      filteredCoins = filteredCoins.filter(coin => favorites.includes(coin.symbol.toLowerCase()));
    }

   
  // Sort favorites to top if user is logged in
  const sorted = filteredCoins.sort((a, b) => {
    if (!user || activeTab === "favorites") return 0;

    const aIsFav = favorites.includes(a.symbol.toLowerCase());
    const bIsFav = favorites.includes(b.symbol.toLowerCase());
    return aIsFav === bIsFav ? 0 : aIsFav ? -1 : 1;
  });

  setDisplayCoin(sorted);
}, [allCoin, favorites, user, activeTab]);

const inputHandler = (e) => {
  setInput(e.target.value);
  if (e.target.value === "") {
    setDisplayCoin(allCoin);
  }
};
// Replace the current searchHandler function (around line 112) with:
const searchHandler = (query) => {
  setSearchQuery(query);
  
  // When query is empty, reset to show all coins based on active tab
  if (query === "") {
    let filteredCoins = [...allCoin];
    
    // Apply tab filters only (no search filter)
    if (activeTab === "gainers") {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h > 0);
    } else if (activeTab === "losers") {
      filteredCoins = filteredCoins.filter(coin => coin.price_change_percentage_24h < 0);
    } else if (activeTab === "favorites" && user) {
      filteredCoins = filteredCoins.filter(coin => favorites.includes(coin.symbol.toLowerCase()));
    }
    
    // Sort favorites to top if user is logged in
    const sorted = filteredCoins.sort((a, b) => {
      if (!user || activeTab === "favorites") return 0;

      const aIsFav = favorites.includes(a.symbol.toLowerCase());
      const bIsFav = favorites.includes(b.symbol.toLowerCase());
      return aIsFav === bIsFav ? 0 : aIsFav ? -1 : 1;
    });

    setDisplayCoin(sorted);
  }
  // The useEffect will handle filtering when searchQuery changes
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
  e.stopPropagation();

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
  setProfileDropdownOpen(false);
};

const formatPrice = (price) => {
  if (price < 0.0001) return price.toFixed(8);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  if (price < 1000) return price.toFixed(2);
  return price.toLocaleString();
};

const formatMarketCap = (cap) => {
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`;
  return cap.toLocaleString();
};

// Define border and hover colors based on theme
const borderColor = darkMode ? "border-gray-700" : "border-gray-300";
const hoverColor = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200";

return (
  <div className={`${theme.bg} ${theme.text} min-h-screen transition-colors duration-300`}>
    {/* Top Navigation Bar */}
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
      ? `${darkMode ? 'bg-[#1f1f1f]' : 'bg-gray-300'} backdrop-blur-md shadow-lg`
      : `${darkMode ? 'bg-[#1f1f1f]' : 'bg-gray-300'}`
      }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              CryptoPulse
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          {/* Search Bar - Desktop & Mobile */}
          <SearchComponent onSearch={searchHandler} theme={theme} darkMode={darkMode} />

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme.button} transition-colors`}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Download Report */}
            {user && (
              <button
                onClick={handleDownload}
                disabled={loading}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Report</span>
              </button>
            )}

            {/* Profile/Auth */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-full ${theme.button} transition-colors`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-[#1f1f1f]' : 'bg-white'} rounded-lg shadow-xl border ${borderColor} py-1 z-50`}>
                      <div className={`px-4 py-2 border-b ${borderColor}`}>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>

                      <Link
                        to="/"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 ${hoverColor} transition-colors`}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>

                      <div className={`border-t ${borderColor} my-1`} />

                      <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 ${hoverColor} transition-colors`}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-full transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full ${theme.button} transition-colors`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mt-3">
          <form onSubmit={searchHandler} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={input}
              onChange={inputHandler}
              className={`w-full pl-10 pr-4 py-2 rounded-full ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
          </form>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <div className="container mx-auto px-4 py-6">
      {/* Stats Header */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Total Market Cap</p>
                <p className="text-2xl font-bold">
                  ${formatMarketCap(allCoin.reduce((sum, coin) => sum + coin.market_cap, 0))}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">24h Volume</p>
                <p className="text-2xl font-bold">
                  ${formatMarketCap(allCoin.reduce((sum, coin) => sum + coin.total_volume, 0))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Active Currencies</p>
                <p className="text-2xl font-bold">{allCoin.length}</p>
              </div>
              <Wallet className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex space-x-1 p-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-xl w-full max-w-md mx-auto`}>
          {[
            { id: "all", label: "All Coins" },
            { id: "gainers", label: "Gainers" },
            { id: "losers", label: "Losers" },
            ...(user ? [{ id: "favorites", label: "Favorites" }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                ? `${darkMode ? 'bg-[#1e1e1e]' : 'bg-white'} ${theme.text} shadow-sm`
                : `${theme.subtext} hover:${theme.text}`
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Crypto Grid */}
      {/* Crypto Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayCoin.slice(0, 20).map((coin) => {
          const isFav = favorites.includes(coin.symbol.toLowerCase());
          const isPositive = coin.price_change_percentage_24h > 0;

          return (
            <div
              key={coin.id}
              className={`group relative ${darkMode ? 'bg-gradient-to-br from-[#1e1e1e] to-[#292929]' : 'bg-gradient-to-br from-white to-gray-100'} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border ${borderColor} hover:-translate-y-1`}
            >
              <Link to={`/coin/${coin.id}`} className="block p-6">
                {/* Favorite Button */}
                {user && (
                  <button
                    onClick={(e) => handleFavClick(e, coin)}
                    disabled={loading}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full ${theme.button} ${darkMode ? 'hover:bg-yellow-900/20' : 'hover:bg-yellow-50'} transition-colors group/fav`}
                    title={isFav ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${isFav
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-400 group-hover/fav:text-yellow-500"
                        }`}
                    />
                  </button>
                )}

                {/* Coin Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className={`font-semibold ${theme.text}`}>
                        {coin.name}
                      </h3>
                      <p className={`text-sm ${theme.subtext} uppercase`}>
                        {coin.symbol}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Data */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.subtext}`}>Price</span>
                    <span className={`font-bold text-lg ${theme.text}`}>
                      {currency.symbol}{formatPrice(coin.current_price)}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.subtext}`}>24h Change</span>
                    <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.subtext}`}>Market Cap</span>
                    <span className={`text-sm font-medium ${theme.text}`}>
                      ${formatMarketCap(coin.market_cap)}
                    </span>
                  </div>
                </div>

                {/* Hover Overlay for Non-Logged In Users */}
                {!user && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-center p-4">
                      <Star className="mx-auto text-yellow-400 mb-2" size={24} />
                      <p className="text-white text-sm font-medium mb-2">Sign in to add favorites</p>
                      <Link
                        to="/login"
                        className="inline-block px-4 py-2 text-sm bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>


      {/* Load More Button */}
      {displayCoin.length > 20 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-full font-medium transition-all duration-200 transform hover:-translate-y-0.5">
            Load More
          </button>
        </div>
      )}
    </div>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
        <div className={`absolute right-0 top-0 h-full w-80 ${theme.bg} p-6 transform transition-transform duration-300`}>
          <div className="flex justify-between items-center mb-8">
            <span className="text-xl font-bold">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {user && (
              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 py-3 px-4 rounded-xl text-white transition disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{loading ? "Processing..." : "Download Report"}</span>
              </button>
            )}

            <div className={`border-t ${borderColor} pt-4`}>
              <p className={`text-sm font-medium ${theme.subtext} mb-2`}>Account</p>
              {user ? (
                <div className="space-y-2">
                  <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-[#1e1e1e]' : 'bg-gray-100'} rounded-xl`}>
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center space-x-2 p-3 text-red-600 dark:text-red-400 ${hoverColor} rounded-xl transition-colors`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className={`block w-full text-center py-3 px-4 ${theme.button} ${hoverColor} rounded-xl transition-colors`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Home;