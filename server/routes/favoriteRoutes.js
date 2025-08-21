import express from "express";
import { toggleFavorite, getFavorites } from "../controllers/favoriteController.js";

const router = express.Router();

router.post("/", toggleFavorite);
router.get("/", getFavorites);

export default router;
