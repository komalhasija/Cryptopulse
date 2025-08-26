import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to ensure a user can't have duplicate favorites
favoriteSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;