import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import CoinContextProvider from './context/CoinContext.jsx'
import ImageContextProvider from './context/ImageContext.jsx'
import ThemeProvider from './context/ThemeContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CoinContextProvider>
          <ImageContextProvider>
            <App />
          </ImageContextProvider>
        </CoinContextProvider>
      </ThemeProvider>

    </BrowserRouter>
  </React.StrictMode>,
)