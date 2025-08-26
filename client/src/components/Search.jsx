// components/SearchComponent.jsx
import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchComponent = ({ onSearch, theme, darkMode }) => {
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Real-time search as user types
  useEffect(() => {
    onSearch(input);
  }, [input, onSearch]);

  const handleClear = () => {
    setInput("");
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Mobile Search Toggle */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`md:hidden p-2 rounded-full ${theme.button}`}
        aria-label="Open search"
      >
        <Search size={20} />
      </button>

      {/* Search Input - Desktop */}
      <div className={`hidden md:flex items-center transition-all duration-300 w-64`}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`w-full pl-10 pr-10 py-2 rounded-full ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Mobile Search */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className={`absolute top-0 left-0 right-0 ${darkMode ? 'bg-[#1f1f1f]' : 'bg-white'} p-4`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className={`w-full pl-10 pr-10 py-3 ${theme.input} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;