const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cryptopulse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const Favorite = mongoose.model('Favorite', { symbol: String });

app.use(cors());
app.use(express.json());

// API: Get and Save Favorites
app.get('/api/favorites', async (req, res) => {
  const favorites = await Favorite.find({});
  res.json(favorites);
});

app.post('/api/favorites', async (req, res) => {
  const { symbol } = req.body;
  await Favorite.create({ symbol });
  res.status(201).send();
});

app.delete('/api/favorites/:symbol', async (req, res) => {
  await Favorite.deleteOne({ symbol: req.params.symbol });
  res.status(204).send();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) =>
  res.sendFile(path.resolve(__dirname, '../client/build/index.html'))
);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));