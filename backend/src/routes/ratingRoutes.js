// src/routes/ratingRoutes.js
import express from "express";

export default function (pool) {
  const router = express.Router();

  // ✅ Submit a rating
  router.post("/", async (req, res) => {
    const { customer_id, matatu_number, rating, comment } = req.body;

    console.log("📝 Rating submission request:", { customer_id, matatu_number, rating, comment });

    if (!customer_id || !matatu_number || !rating) {
      console.log("❌ Missing required fields:", { customer_id, matatu_number, rating });
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // ✅ Save rating directly (no payment check) - use matatu_id for production compatibility
      const result = await pool.query(
        "INSERT INTO ratings (customer_id, matatu_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id",
        [customer_id, matatu_number, rating, comment]
      );

      console.log("✅ Rating saved successfully:", result.rows[0]);
      res.status(201).json({ message: "Rating submitted successfully" });
    } catch (err) {
      console.error("❌ Error saving rating:", err);
      console.error("❌ Error details:", {
        code: err.code,
        detail: err.detail,
        constraint: err.constraint,
        message: err.message
      });
      res.status(500).json({ 
        error: "Failed to save rating",
        details: err.message 
      });
    }
  });

  // ✅ Fetch ratings for a specific matatu
  router.get("/:matatu_number", async (req, res) => {
    const { matatu_number } = req.params;

    try {
      const result = await pool.query(
        "SELECT rating, comment, created_at FROM ratings WHERE matatu_id = $1 ORDER BY created_at DESC",
        [matatu_number]
      );

      res.json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching ratings:", err);
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  return router;
}
