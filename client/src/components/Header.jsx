import { useState, useEffect } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleDownload = () => {
    alert("Download clicked — implement your logic here!");
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 m-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-4 ">CryptoPulse</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Real-Time Cryptocurrency Tracker
        </p>
      </div>
      

      <div className="flex gap-3 sm:gap-4 flex-wrap">
        <button onClick={handleDownload} className="bg-[#1E213A] text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 transition ">
          Download Report
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-xl text-sm text-black dark:text-white hover:opacity-90 transition"
        >
          {isDark ? "☀️ " : "🌙 "}
        </button>
      </div>
    </div>
  );
}
