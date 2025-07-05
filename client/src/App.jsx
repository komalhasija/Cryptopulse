// import CryptoCard from "./components/CryptoCard";
// import Header from "./components/Header";

// const coins = [
//   {
//     name: "BTC", label: "Bitcoin", price: "67543.21", change: "2.35", icon: "/btc.png",
//   },
//   { name: "ETH", label: "Ethereum", price: "3255.67", change: "4.27", icon: "/eth.png" },
//   { name: "USDT", label: "Tether", price: "0.0991", change: "-0.03", icon: "/usdt.png" },
//   { name: "BNB", label: "Binance Coin", price: "596.65", change: "1.33", icon: "/bnb.png" },
//   { name: "SOL", label: "Solana", price: "152.39", change: "-1.25", icon: "/sol.png" },
//   { name: "XRP", label: "XRP", price: "0.5385", change: "0.36", icon: "/xrp.png" },
//   { name: "ADA", label: "Cardano", price: "0.4791", change: "3.78", icon: "/ada.png" },
//   { name: "AVAX", label: "Avalanche", price: "38.96", change: "2.57", icon: "/avax.png" },
//   { name: "DOGE", label: "Dogecoin", price: "0.1628", change: "-0.52", icon: "/doge.png" },
// ];

// export default function App() {
//   return (
//     <div className="min-h-screen bg-[#0B0F1A] px-6 py-8 text-white">
//       <Header/>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {coins.map((coin) => (
//           <CryptoCard key={coin.name} {...coin} />
//         ))}
//       </div>

//       <div className="mt-8">
//         <div className="flex justify-between items-center mb-2">
//           <h2 className="text-xl font-semibold">Price Chart</h2>
//           <button className="bg-[#1E213A] px-2 py-1 rounded text-sm">24H</button>
//         </div>
//         <div className="h-[300px] bg-[#1E213A] rounded-xl flex items-center justify-center text-gray-400">
//           {/* Insert chart here using Recharts or Chart.js */}
//           Chart Goes Here
//         </div>
//       </div>
//     </div>
//   );
// }
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Coin from "./pages/Coin";
import Home from "./pages/Home";


const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#121212] text-black dark:text-white transition-colors duration-300">
     
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coin/:coinId" element={<Coin/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
