const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'CryptoPulse backend is working 🚀' });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

// Create WebSocket Server for frontend clients
const wss = new WebSocket.Server({ server });

// CoinCap WebSocket connection
const coinCapSocket = new WebSocket(
  'wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,cardano,polkadot'
);

let latestPrices = {}; // store latest prices

// Handle CoinCap messages
coinCapSocket.on('message', (msg) => {
  try {
    const data = JSON.parse(msg.toString());
    latestPrices = { ...latestPrices, ...data };

    // Broadcast to frontend clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'price-update', data: latestPrices }));
      }
    });
  } catch (err) {
    console.error('Failed to parse message from CoinCap:', err.message);
  }
});

coinCapSocket.on('open', () => {
  console.log('Connected to CoinCap WebSocket ✅');
});

coinCapSocket.on('error', (err) => {
  console.error('CoinCap WebSocket error:', err.message);
});

coinCapSocket.on('close', () => {
  console.log('CoinCap WebSocket closed ❌');
});

// Handle frontend WebSocket connections
wss.on('connection', (socket, req) => {
  console.log('Frontend WebSocket connected');

  // Optional: Validate origin
  // const origin = req.headers.origin;
  // if (origin !== 'http://localhost:3000') {
  //   socket.terminate();
  //   return;
  // }

  // Send initial prices
  if (Object.keys(latestPrices).length > 0) {
    socket.send(JSON.stringify({ type: 'price-update', data: latestPrices }));
  }

  socket.on('close', () => {
    console.log('Frontend WebSocket disconnected');
  });
});
