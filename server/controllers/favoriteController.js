import Favorite from "../models/Favorite.js";

// Add or remove favorites for the authenticated user
export const toggleFavorite = async (req, res) => {
  const { symbol, name, image } = req.body;

  try {
    // Check if favorite already exists for this user
    const existing = await Favorite.findOne({ 
      symbol: symbol, 
      user: req.user.id 
    });

    if (existing) {
      await Favorite.deleteOne({ 
        symbol: symbol, 
        user: req.user.id 
      });
      return res.status(200).json({ 
        message: "Removed from favorites", 
        status: "removed" 
      });
    } else {
      const newFav = new Favorite({ 
        symbol, 
        name, 
        image, 
        user: req.user.id 
      });
      await newFav.save();
      return res.status(201).json({ 
        message: "Added to favorites", 
        status: "added" 
      });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res.status(500).json({ error: "Failed to toggle favorite" });
  }
};

// Get all favorites for the authenticated user
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id });
    res.json(favorites);
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

// Delete a specific favorite for the authenticated user
export const deleteFavorite = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({ 
      symbol: symbol, 
      user: req.user.id 
    });
    
    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    
    res.json({ message: "Favorite removed successfully" });
  } catch (err) {
    console.error("Delete favorite error:", err);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
};