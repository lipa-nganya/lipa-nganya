// src/index.js
import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const { Pool } = pkg;

import mpesaRoutes from "./routes/mpesaRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js"; // ✅ NEW

const app = express();

// ✅ CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ✅ PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection error:", err.stack));

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Lipa Nganya Backend is running 🚀");
});

// ✅ Customers route
app.get("/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching customers");
  }
});

// ✅ Matatu info route
app.get("/matatus/:id", async (req, res) => {
  const matatuId = req.params.id;
  try {
    const query = `
      SELECT m.id AS matatu_number, m.route_name, s.name AS sacco_name
      FROM matatus m
      JOIN saccos s ON m.sacco_id = s.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [matatuId]);

    if (!result.rows.length) {
      return res.status(404).json({ error: "Matatu not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching matatu");
  }
});

// ✅ MPESA routes
app.use("/api/mpesa", mpesaRoutes(pool));

// ✅ Ratings routes
app.use("/api/ratings", ratingRoutes(pool)); // ✅ NEW

// ✅ Start server
const PORT = process.env.PORT || 7070;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
