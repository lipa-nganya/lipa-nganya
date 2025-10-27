// src/index.js
import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const { Pool } = pkg;

import mpesaRoutes from "./routes/mpesaRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

const app = express();

// ✅ CORS - allow live frontend and local dev
app.use(
  cors({
    origin: [
      "https://lipa-nganya.onrender.com", // live frontend
      "http://localhost:5173",            // local frontend
      "http://127.0.0.1:5173"            // alternative local frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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

// ✅ Test database tables
app.get("/test-db", async (req, res) => {
  try {
    console.log("🔍 Testing database tables...");
    
    // Test customers table
    const customersResult = await pool.query("SELECT COUNT(*) FROM customers");
    console.log(`✅ Customers table: ${customersResult.rows[0].count} records`);
    
    // Test payments table
    const paymentsResult = await pool.query("SELECT COUNT(*) FROM payments");
    console.log(`✅ Payments table: ${paymentsResult.rows[0].count} records`);
    
    // Test matatus table
    const matatusResult = await pool.query("SELECT COUNT(*) FROM matatus");
    console.log(`✅ Matatus table: ${matatusResult.rows[0].count} records`);
    
    res.json({
      customers: customersResult.rows[0].count,
      payments: paymentsResult.rows[0].count,
      matatus: matatusResult.rows[0].count,
      message: "Database tables accessible"
    });
  } catch (error) {
    console.error("❌ Database test error:", error);
    res.status(500).json({ 
      error: "Database test failed", 
      details: error.message 
    });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  console.log("✅ Health check requested");
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
  console.log(`🔍 Fetching matatu with ID: ${matatuId}`);
  
  try {
    const query = `
      SELECT m.id AS matatu_number, m.route_name, s.name AS sacco_name
      FROM matatus m
      JOIN saccos s ON m.sacco_id = s.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [matatuId]);

    if (!result.rows.length) {
      console.log(`❌ Matatu not found: ${matatuId}`);
      return res.status(404).json({ error: "Matatu not found" });
    }

    console.log(`✅ Matatu found: ${JSON.stringify(result.rows[0])}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Error fetching matatu ${matatuId}:`, error);
    res.status(500).json({ error: "Error fetching matatu" });
  }
});

// ✅ MPESA routes
app.use("/api/mpesa", mpesaRoutes(pool));

// ✅ Ratings routes
app.use("/api/ratings", ratingRoutes(pool));

// ✅ Customer routes
app.use("/api/customers", customerRoutes);

// ✅ Start server
const PORT = process.env.PORT || 7070;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
