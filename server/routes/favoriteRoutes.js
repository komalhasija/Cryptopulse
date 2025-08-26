import express from 'express';
import { toggleFavorite, getFavorites, deleteFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js'; // Your auth middleware

const router = express.Router();

router.route('/')
  .post(protect, toggleFavorite)
  .get(protect, getFavorites);

router.route('/:symbol')
  .delete(protect, deleteFavorite);

export default router;