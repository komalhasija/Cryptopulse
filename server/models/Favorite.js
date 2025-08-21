import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  image: String,
});

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
