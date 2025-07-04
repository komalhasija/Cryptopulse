import React, { useContext, useEffect, useState } from "react";
import { CoinContext } from "../context/CoinContext.jsx";
import { Link } from "react-router-dom";

const Home = () => {
  const { allCoin, currency } = useContext(CoinContext);
  const [displayCoin, setDisplayCoin] = useState([]);
  const [input, setInput] = useState("");

  const inputHandler = (event) => {
    setInput(event.target.value);
    if (event.target.value === "") {
      setDisplayCoin(allCoin);
    }
  };

  const searchHandler = async (event) => {
    event.preventDefault();
    const coins = allCoin.filter((item) =>
      item.name.toLowerCase().includes(input.toLowerCase())
    );
    setDisplayCoin(coins);
  };

  useEffect(() => {
    setDisplayCoin(allCoin);
  }, [allCoin]);

  return (
    <div className="pb-24 px-4">
      <div className="max-w-xl mx-auto mt-20 flex flex-col items-center text-center gap-8">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Largest <br /> Crypto Marketplace
        </h1>
        <p className="text-gray-400 w-3/4 leading-relaxed">
          Welcome to the world's largest cryptocurrency
        </p>
        <form
          onSubmit={searchHandler}
          className="w-4/5 bg-white flex items-center gap-3 px-4 py-2 rounded-md shadow-md text-black"
        >
          <input
            type="text"
            list="coinlist"
            placeholder="Search crypto..."
            onChange={inputHandler}
            value={input}
            required
            className="flex-1 text-base outline-none bg-transparent"
          />
          <datalist id="coinlist">
            {allCoin.map((item, index) => (
              <option key={index} value={item.name} />
            ))}
          </datalist>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm"
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-purple-100/30 to-pink-100/30 rounded-xl">
        <div className="grid grid-cols-5 p-4 border-b border-gray-600 font-semibold text-sm">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p className="text-center">24H Change</p>
          <p className="text-right hidden sm:block">Market Cap</p>
        </div>

        {displayCoin.slice(0, 10).map((item, index) => (
          <Link
            to={`/coin/${item.id}`}
            className="grid grid-cols-5 p-4 border-b border-gray-700 items-center text-sm hover:bg-purple-50/10 transition"
            key={index}
          >
            <p>{item.market_cap_rank}</p>
            <div className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-8 sm:w-9" />
              <p>{`${item.name} - ${item.symbol}`}</p>
            </div>
            <p>
              {currency.symbol} {item.current_price.toLocaleString()}
            </p>
            <p
              className={`text-center font-medium ${
                item.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.floor(item.price_change_percentage_24h * 100) / 100}
            </p>
            <p className="text-right hidden sm:block">
              {currency.symbol} {item.market_cap.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;

