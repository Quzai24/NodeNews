import { Router } from "express";
import { getDB } from "../db/connection.js";

const router = Router();

// GET /api/search?category=Politics&q=keyword
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { category, q } = req.query;

    // Build the query filter
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (q) {
      // Search in title and content using regex (case insensitive)
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    const posts = await db
      .collection("posts")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to search posts." });
  }
});

// GET /api/search/categories — Get list of available categories
router.get("/categories", async (req, res) => {
  try {
    const categories = ["Politics", "Tech", "Health", "World", "Science"];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

export default router;
