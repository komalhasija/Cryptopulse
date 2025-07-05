
import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Coin from "./pages/Coin";
import Home from "./pages/Home";


const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-400 dark:bg-[#121212] text-black dark:text-white transition-colors duration-300">
     
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
