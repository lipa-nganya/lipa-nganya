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
import authRoutes from "./routes/authRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

const app = express();

// ✅ CORS - allow live frontend and local dev
app.use(
  cors({
    origin: [
      "https://lipa-nganya.onrender.com", // live frontend
      "http://localhost:5173",            // local customer frontend
      "http://127.0.0.1:5173",           // alternative local customer frontend
      "http://localhost:5175",           // local driver frontend
      "http://127.0.0.1:5175"            // alternative local driver frontend
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

// ✅ Auth routes
app.use("/api/auth", authRoutes);

// ✅ Driver routes
app.use("/api/auth", driverRoutes);

// ✅ Matatu search endpoint for driver login
app.get("/api/matatus/search", async (req, res) => {
  const { number } = req.query;
  
  console.log(`🔍 Searching for matatu with number: ${number}`);
  
  if (!number) {
    return res.status(400).json({ error: "Matatu number is required" });
  }
  
  try {
    // For now, return mock data - in production this would query the database
    const mockMatatu = {
      id: 1,
      number: number.toUpperCase(),
      route_name: "Route 1",
      sacco_name: "Sacco A",
      plate_number: number.toUpperCase(),
      routes: ["Route 1", "Route 2", "Route 3"]
    };
    
    console.log(`✅ Matatu found:`, mockMatatu);
    res.json(mockMatatu);
    
  } catch (error) {
    console.error(`❌ Error searching matatu:`, error);
    res.status(500).json({ error: "Error searching matatu" });
  }
});

// Get matatu by ID endpoint
app.get("/api/matatus/:id", async (req, res) => {
  const matatuId = req.params.id;
  
  console.log(`🔍 Fetching matatu with ID: ${matatuId}`);
  
  try {
    const result = await pool.query(
      'SELECT m.*, s.name as sacco_name FROM matatus m JOIN saccos s ON m.sacco_id = s.id WHERE m.id = $1',
      [matatuId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Matatu not found" });
    }
    
    const matatu = result.rows[0];
    console.log(`✅ Matatu found:`, matatu);
    res.json(matatu);
    
  } catch (error) {
    console.error(`❌ Error fetching matatu:`, error);
    res.status(500).json({ error: "Error fetching matatu" });
  }
});

// ✅ Matatu payments endpoint
app.get("/api/matatus/:id/payments", async (req, res) => {
  const { id } = req.params;
  
  console.log(`🔍 Fetching payments for matatu ID: ${id}`);
  
  try {
    const result = await pool.query(
      'SELECT p.*, c.name as customer_name FROM payments p LEFT JOIN customers c ON p.customer_id = c.id WHERE p.matatu_id = $1 ORDER BY p.created_at DESC',
      [id]
    );
    
    const payments = result.rows;
    console.log(`✅ Found ${payments.length} payments for matatu ${id}`);
    res.json(payments);
    
  } catch (error) {
    console.error(`❌ Error fetching payments:`, error);
    res.status(500).json({ error: "Error fetching payments" });
  }
});

// ✅ Matatu earnings endpoint
app.get("/api/matatus/:id/earnings", async (req, res) => {
  const { id } = req.params;
  
  console.log(`🔍 Fetching earnings for matatu ID: ${id}`);
  
  try {
    // Calculate earnings from actual payments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [todayResult, weekResult, monthResult] = await Promise.all([
      pool.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE matatu_id = $1 AND status = $2 AND created_at >= $3',
        [id, 'completed', today]
      ),
      pool.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE matatu_id = $1 AND status = $2 AND created_at >= $3',
        [id, 'completed', weekStart]
      ),
      pool.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE matatu_id = $1 AND status = $2 AND created_at >= $3',
        [id, 'completed', monthStart]
      )
    ]);
    
    const earnings = {
      today: parseFloat(todayResult.rows[0].total),
      week: parseFloat(weekResult.rows[0].total),
      month: parseFloat(monthResult.rows[0].total)
    };
    
    console.log(`✅ Earnings for matatu ${id}:`, earnings);
    res.json(earnings);
    
  } catch (error) {
    console.error(`❌ Error fetching earnings:`, error);
    res.status(500).json({ error: "Error fetching earnings" });
  }
});

// ✅ Matatu ratings endpoint
app.get("/api/matatus/:id/ratings", async (req, res) => {
  const { id } = req.params;
  
  console.log(`🔍 Fetching ratings for matatu ID: ${id}`);
  
  try {
    // Mock ratings data - in production this would query the database
    const mockRatings = {
      average: 4.2,
      count: 15,
      recent: [
        { rating: 5, comment: "Great service!", date: "2024-01-15" },
        { rating: 4, comment: "Good driver", date: "2024-01-14" },
        { rating: 5, comment: "Very clean", date: "2024-01-13" }
      ]
    };
    
    console.log(`✅ Ratings for matatu ${id}:`, mockRatings);
    res.json(mockRatings);
    
  } catch (error) {
    console.error(`❌ Error fetching ratings:`, error);
    res.status(500).json({ error: "Error fetching ratings" });
  }
});

// ✅ Trip management endpoints
app.post("/api/trips/start", async (req, res) => {
  const { matatuId, route, driverId } = req.body;
  
  console.log(`🔍 Starting trip for matatu ${matatuId} on route ${route}`);
  
  try {
    // Mock trip data - in production this would create a trip record
    const mockTrip = {
      id: Math.floor(Math.random() * 1000),
      matatu_id: matatuId,
      driver_id: driverId,
      route: route,
      status: "active",
      start_time: new Date().toISOString(),
      trip_count: 0
    };
    
    console.log(`✅ Trip started:`, mockTrip);
    res.json({ 
      success: true, 
      message: "Trip started successfully",
      trip: mockTrip 
    });
    
  } catch (error) {
    console.error(`❌ Error starting trip:`, error);
    res.status(500).json({ error: "Error starting trip" });
  }
});

app.post("/api/trips/:id/end", async (req, res) => {
  const { id } = req.params;
  const { tripCount } = req.body;
  
  console.log(`🔍 Ending trip ${id} with ${tripCount} passengers`);
  
  try {
    // Mock trip completion - in production this would update the trip record
    const mockTrip = {
      id: parseInt(id),
      status: "completed",
      end_time: new Date().toISOString(),
      trip_count: tripCount || 1,
      earnings: (tripCount || 1) * 50 // Mock calculation
    };
    
    console.log(`✅ Trip ended:`, mockTrip);
    res.json({ 
      success: true, 
      message: "Trip ended successfully",
      trip: mockTrip 
    });
    
  } catch (error) {
    console.error(`❌ Error ending trip:`, error);
    res.status(500).json({ error: "Error ending trip" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 7070;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
