// controllers/ratingController.js
import dotenv from "dotenv";

dotenv.config();

export const submitRating = async (req, res, pool) => {
  const { customerId, matatuId, rating, comment } = req.body;

  if (!customerId || !matatuId || !rating) {
    return res.status(400).json({ message: "customerId, matatuId and rating are required" });
  }

  try {
    // 1️⃣ Verify successful payment
    const paymentCheck = await pool.query(
      "SELECT * FROM payments WHERE customer_id=$1 AND matatu_id=$2 AND status='success'",
      [customerId, matatuId]
    );

    if (paymentCheck.rows.length === 0) {
      return res.status(403).json({
        message: "You can only rate a matatu you have successfully paid for.",
      });
    }

    // 2️⃣ Optional: prevent multiple ratings per trip/day
    const existingRating = await pool.query(
      "SELECT * FROM ratings WHERE customer_id=$1 AND matatu_id=$2 AND created_at > NOW() - INTERVAL '1 day'",
      [customerId, matatuId]
    );

    if (existingRating.rows.length > 0) {
      return res.status(400).json({
        message: "You can only rate this matatu once per day.",
      });
    }

    // 3️⃣ Insert rating
    await pool.query(
      "INSERT INTO ratings(customer_id, matatu_id, rating, comment) VALUES($1,$2,$3,$4)",
      [customerId, matatuId, rating, comment || null]
    );

    res.status(201).json({ message: "Rating submitted successfully" });
  } catch (error) {
    console.error("❌ Error submitting rating:", error);
    res.status(500).json({ message: "Server error submitting rating" });
  }
};

export const getMatatuRatings = async (req, res, pool) => {
  const { matatuId } = req.params;

  try {
    const result = await pool.query(
      "SELECT rating, comment, created_at FROM ratings WHERE matatu_id=$1 ORDER BY created_at DESC",
      [matatuId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching ratings:", error);
    res.status(500).json({ message: "Error fetching ratings" });
  }
};
