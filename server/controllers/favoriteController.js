import Favorite from "../models/Favorite.js";
import User from "../models/User.js"; // Make sure to import User model

// Add or remove favorites for the authenticated user
export const toggleFavorite = async (req, res) => {
  const { symbol, name, image } = req.body;

  try {
    // Normalize symbol to lowercase for consistency
    const normalizedSymbol = symbol.toLowerCase();
    
    // Check if favorite already exists for this user
    const existing = await Favorite.findOne({ 
      symbol: normalizedSymbol, 
      user: req.user.id 
    });

    if (existing) {
      await Favorite.deleteOne({ 
        symbol: normalizedSymbol, 
        user: req.user.id 
      });
      
      // Remove from user's favorites array
      await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { favorites: existing._id } }
      );
      
      return res.status(200).json({ 
        message: "Removed from favorites", 
        status: "removed" 
      });
    } else {
      const newFav = new Favorite({ 
        symbol: normalizedSymbol, 
        name, 
        image, 
        user: req.user.id 
      });
      await newFav.save();
      
      // Add to user's favorites array
      await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { favorites: newFav._id } }
      );
      
      return res.status(201).json({ 
        message: "Added to favorites", 
        status: "added",
        favorite: newFav // Optionally return the created favorite
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
    // Option 1: Get favorites through User population
    const userWithFavorites = await User.findById(req.user.id)
      .populate('favorites');
    
    res.json(userWithFavorites.favorites);
    
    // Option 2: Get favorites directly from Favorite collection (your original approach)
    // const favorites = await Favorite.find({ user: req.user.id })
    //   .sort({ createdAt: -1 });
    // res.json(favorites);
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};

// Delete a specific favorite for the authenticated user
export const deleteFavorite = async (req, res) => {
  try {
    const { symbol } = req.params;
    const normalizedSymbol = symbol.toLowerCase();
    
    const favorite = await Favorite.findOneAndDelete({ 
      symbol: normalizedSymbol, 
      user: req.user.id 
    });
    
    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    
    // Remove from user's favorites array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: favorite._id } }
    );
    
    res.json({ message: "Favorite removed successfully" });
  } catch (err) {
    console.error("Delete favorite error:", err);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
};