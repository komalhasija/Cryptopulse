import { createContext, useEffect, useRef, useState } from "react";
export const ImageContext = createContext();

const ImageContextProvider = (props) => {
  const [images, setImages] = useState([]);
  const [currency, setCurrency] = useState({
    name: "usd",
    symbol: "$",
  });


  const fetchImages = async () => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': '	CG-ftn8r8Vk5dGYy2LPnT9sX9TM'
            }
        };

        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}`, options)
        .then(response => response.json())
        .then(response => setImages(response))
        .catch(err => console.error(err));
    }

    useEffect(() => {
        fetchImages();
    }, [])
const contextValue = {
    images,
    currency,
    setCurrency,
  };

 
  return (
    <ImageContext.Provider value={contextValue}>
      {props.children}
    </ImageContext.Provider>
  );
};

export default ImageContextProvider;
