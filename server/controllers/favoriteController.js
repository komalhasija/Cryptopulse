import Favorite from "../models/Favorite.js";

// Add or remove favorites
export const toggleFavorite = async (req, res) => {
  const { symbol, name, image } = req.body;

  try {
    const existing = await Favorite.findOne({ symbol });

    if (existing) {
      await Favorite.deleteOne({ symbol });
      return res.status(200).json({ message: "Removed from favorites", status: "removed" });
    } else {
      const newFav = new Favorite({ symbol, name, image });
      await newFav.save();
      return res.status(201).json({ message: "Added to favorites", status: "added" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to toggle favorite" });
  }
};

// Get all favorites
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};
