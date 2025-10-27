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
import walletRoutes from "./routes/walletRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { creditPaymentToMatatuWallet, recalculateWalletBalances } from './services/walletService.js';

const app = express();

// ✅ CORS - allow live frontend and local dev
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "https://lipa-nganya-customer.onrender.com", // customer app on Render
        "https://lipa-nganya-driver.onrender.com",   // driver app on Render
        "https://lipa-nganya-admin.onrender.com",   // admin app on Render
        "https://lipa-nganya.onrender.com",          // legacy frontend
        "http://localhost:5173",                     // local customer frontend
        "http://127.0.0.1:5173",                    // alternative local customer frontend
        "http://localhost:5175",                     // local driver frontend
        "http://127.0.0.1:5175",                    // alternative local driver frontend
        "http://localhost:5176",                     // local admin frontend
        "http://127.0.0.1:5176"                     // alternative local admin frontend
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
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
  .then(async () => {
    console.log("✅ Connected to PostgreSQL");
    
    // ✅ Create missing tables on startup (for Render compatibility)
    try {
      console.log("🔧 Ensuring database tables exist...");
      
      // Create drivers table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS drivers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) UNIQUE NOT NULL,
          role VARCHAR(50) NOT NULL,
          matatu_id INTEGER REFERENCES matatus(id),
          pin VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create wallet tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS matatu_wallets (
          id SERIAL PRIMARY KEY,
          matatu_id INTEGER UNIQUE REFERENCES matatus(id),
          balance DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS driver_wallets (
          id SERIAL PRIMARY KEY,
          driver_id INTEGER UNIQUE REFERENCES drivers(id),
          balance DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conductor_wallets (
          id SERIAL PRIMARY KEY,
          conductor_id INTEGER UNIQUE REFERENCES drivers(id),
          balance DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS wallet_transactions (
          id SERIAL PRIMARY KEY,
          wallet_type VARCHAR(20) NOT NULL,
          wallet_id INTEGER NOT NULL,
          transaction_type VARCHAR(50) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          description TEXT,
          reference_id VARCHAR(100),
          created_by INTEGER REFERENCES drivers(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add wallet_credited column to payments table if it doesn't exist
      await pool.query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS wallet_credited BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(100)
      `);
      
      console.log("✅ Database tables verified/created");
      
      // Add sample data if needed
      const driversResult = await pool.query('SELECT COUNT(*) FROM drivers');
      if (parseInt(driversResult.rows[0].count) === 0) {
        console.log("📝 Adding sample drivers and conductors...");
        
        // Ensure we have matatus first
        const matatusResult = await pool.query('SELECT COUNT(*) FROM matatus');
        if (parseInt(matatusResult.rows[0].count) === 0) {
          await pool.query(`
            INSERT INTO saccos (name) VALUES 
            ('KBS Sacco'), ('City Hoppa'), ('Metro Trans'), ('Easy Coach')
            ON CONFLICT DO NOTHING
          `);
          
          await pool.query(`
            INSERT INTO matatus (route_name, sacco_id) VALUES 
            ('CBD to Westlands', 1),
            ('CBD to Eastleigh', 2),
            ('CBD to Karen', 1),
            ('CBD to Thika', 3),
            ('CBD to Rongai', 4)
            ON CONFLICT DO NOTHING
          `);
        }
        
        // Add sample drivers and conductors
        await pool.query(`
          INSERT INTO drivers (name, phone, role, matatu_id, pin) VALUES 
          ('John Kamau', '254708374153', 'driver', 1, '1234'),
          ('Mary Wanjiku', '254708374154', 'driver', 2, '5678'),
          ('Peter Mwangi', '254708374155', 'driver', 3, '9012'),
          ('Grace Akinyi', '254708374156', 'driver', 4, '3456'),
          ('David Ochieng', '254708374157', 'driver', 5, '7890'),
          ('James Mutua', '254708374158', 'conductor', 1, '1111'),
          ('Sarah Njeri', '254708374159', 'conductor', 2, '2222'),
          ('Michael Kiprop', '254708374160', 'conductor', 3, '3333'),
          ('Esther Wambui', '254708374161', 'conductor', 4, '4444'),
          ('Samuel Otieno', '254708374162', 'conductor', 5, '5555')
          ON CONFLICT (phone) DO NOTHING
        `);
        
        // Create wallets for ALL matatus (including any added later)
        const allMatatus = await pool.query('SELECT id FROM matatus');
        for (const matatu of allMatatus.rows) {
          await pool.query(
            'INSERT INTO matatu_wallets (matatu_id, balance) VALUES ($1, $2) ON CONFLICT (matatu_id) DO NOTHING',
            [matatu.id, 0] // Start with 0 balance, will be recalculated
          );
        }
        
        const drivers = await pool.query('SELECT id FROM drivers WHERE role = $1', ['driver']);
        for (const driver of drivers.rows) {
          await pool.query(
            'INSERT INTO driver_wallets (driver_id, balance) VALUES ($1, $2) ON CONFLICT (driver_id) DO NOTHING',
            [driver.id, Math.floor(Math.random() * 5000) + 1000]
          );
        }
        
        const conductors = await pool.query('SELECT id FROM drivers WHERE role = $1', ['conductor']);
        for (const conductor of conductors.rows) {
          await pool.query(
            'INSERT INTO conductor_wallets (conductor_id, balance) VALUES ($1, $2) ON CONFLICT (conductor_id) DO NOTHING',
            [conductor.id, Math.floor(Math.random() * 3000) + 500]
          );
        }
        
        // Add sample wallet transactions to make balances realistic
        console.log("📝 Adding sample wallet transactions...");
        
        // Add some payment_received transactions for matatu wallets
        const matatuWallets = await pool.query('SELECT id, matatu_id FROM matatu_wallets');
        for (const wallet of matatuWallets.rows) {
          const transactionCount = Math.floor(Math.random() * 10) + 5; // 5-15 transactions
          for (let i = 0; i < transactionCount; i++) {
            const amount = Math.floor(Math.random() * 200) + 50; // 50-250 KES
            const phone = `2547${Math.floor(Math.random() * 100000000)}`;
            await pool.query(
              'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id) VALUES ($1, $2, $3, $4, $5, $6)',
              ['matatu', wallet.id, 'payment_received', amount, `Customer payment from ${phone}`, `MP${Date.now()}${i}`]
            );
          }
        }
        
        // Add some salary payments for driver wallets
        const driverWallets = await pool.query('SELECT id, driver_id FROM driver_wallets');
        for (const wallet of driverWallets.rows) {
          const salaryAmount = Math.floor(Math.random() * 5000) + 2000; // 2000-7000 KES
          await pool.query(
            'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id) VALUES ($1, $2, $3, $4, $5, $6)',
            ['driver', wallet.id, 'salary_payment', salaryAmount, 'Monthly salary payment', `SAL${Date.now()}`]
          );
        }
        
        // Add some salary payments for conductor wallets
        const conductorWallets = await pool.query('SELECT id, conductor_id FROM conductor_wallets');
        for (const wallet of conductorWallets.rows) {
          const salaryAmount = Math.floor(Math.random() * 3000) + 1000; // 1000-4000 KES
          await pool.query(
            'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id) VALUES ($1, $2, $3, $4, $5, $6)',
            ['conductor', wallet.id, 'salary_payment', salaryAmount, 'Monthly salary payment', `SAL${Date.now()}`]
          );
        }
        
        console.log("✅ Sample data added");
        
        // Recalculate wallet balances from actual transactions
        console.log("🔄 Recalculating wallet balances from transactions...");
        await recalculateWalletBalances();
      }
      
    } catch (error) {
      console.error("❌ Error setting up database tables:", error);
    }
  })
  .catch((err) => console.error("❌ Database connection error:", err.stack));

// ✅ CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

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
app.use("/api/driver", driverRoutes);

// ✅ Wallet routes
app.use("/api/wallet", walletRoutes);

// ✅ LP Wallet API endpoints
app.get("/api/wallet/matatu/:matatuId/balance", async (req, res) => {
  const { matatuId } = req.params;
  
  try {
    // Ensure wallet exists for this matatu
    await pool.query(
      'INSERT INTO matatu_wallets (matatu_id, balance) VALUES ($1, $2) ON CONFLICT (matatu_id) DO NOTHING',
      [matatuId, 0]
    );
    
    const result = await pool.query(
      'SELECT balance FROM matatu_wallets WHERE matatu_id = $1',
      [matatuId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Matatu wallet not found' });
    }
    
    res.json({ 
      matatuId: parseInt(matatuId),
      balance: parseFloat(result.rows[0].balance)
    });
  } catch (error) {
    console.error('❌ Error getting matatu wallet balance:', error);
    res.status(500).json({ error: 'Error getting wallet balance' });
  }
});

app.get("/api/wallet/matatu/:matatuId/transactions", async (req, res) => {
  const { matatuId } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const result = await pool.query(
      `SELECT wt.*, p.phone as customer_phone, c.name as customer_name
       FROM wallet_transactions wt
       LEFT JOIN payments p ON wt.reference_id = p.mpesa_transaction_id
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE wt.wallet_type = 'matatu' 
       AND wt.wallet_id = (SELECT id FROM matatu_wallets WHERE matatu_id = $1)
       ORDER BY wt.created_at DESC
       LIMIT $2`,
      [matatuId, limit]
    );
    
    res.json({
      matatuId: parseInt(matatuId),
      transactions: result.rows
    });
  } catch (error) {
    console.error('❌ Error getting matatu wallet transactions:', error);
    res.status(500).json({ error: 'Error getting wallet transactions' });
  }
});

// ✅ Manual wallet credit endpoint (for testing)
app.post("/api/wallet/matatu/:matatuId/credit", async (req, res) => {
  const { matatuId } = req.params;
  const { amount, description, referenceId } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }
  
  try {
    // Get matatu wallet ID
    const walletResult = await pool.query(
      'SELECT id FROM matatu_wallets WHERE matatu_id = $1',
      [matatuId]
    );
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Matatu wallet not found' });
    }
    
    const walletId = walletResult.rows[0].id;
    
    // Credit the amount
    const updateResult = await pool.query(
      'UPDATE matatu_wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
      [amount, walletId]
    );
    
    const newBalance = updateResult.rows[0].balance;
    
    // Create transaction record
    await pool.query(
      'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id) VALUES ($1, $2, $3, $4, $5, $6)',
      ['matatu', walletId, 'manual_credit', amount, description || 'Manual credit', referenceId || null]
    );
    
    res.json({
      success: true,
      matatuId: parseInt(matatuId),
      amount: parseFloat(amount),
      newBalance: parseFloat(newBalance),
      message: 'Wallet credited successfully'
    });
  } catch (error) {
    console.error('❌ Error crediting wallet:', error);
    res.status(500).json({ error: 'Error crediting wallet' });
  }
});

// ✅ Direct wallet crediting for successful payments
app.post("/api/test/credit-wallet/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  
  try {
    console.log(`🧪 Crediting wallet for payment ${paymentId}...`);
    
    // Get the successful payment
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND status = $2',
      [paymentId, 'success']
    );
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Successful payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    
    // Credit to matatu wallet
    const walletResult = await creditPaymentToMatatuWallet({
      matatuId: payment.matatu_id,
      amount: parseFloat(payment.amount),
      phone: payment.phone,
      mpesaTransactionId: payment.mpesa_transaction_id
    });
    
    if (walletResult.success) {
      console.log(`✅ Payment credited to matatu wallet: ${walletResult.newBalance}`);
      res.json({
        success: true,
        message: 'Payment credited to wallet successfully',
        payment: payment,
        walletBalance: walletResult.newBalance
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to credit payment to wallet',
        details: walletResult.error
      });
    }
  } catch (error) {
    console.error('❌ Error crediting wallet:', error);
    res.status(500).json({ error: 'Error crediting wallet', details: error.message });
  }
});

// ✅ Direct payment update test
app.post("/api/test/direct-update/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  
  try {
    console.log(`🧪 Direct update for payment ${paymentId}...`);
    
    // Direct SQL update
    const result = await pool.query(
      `UPDATE payments 
       SET status = 'success', 
           mpesa_transaction_id = $1 
       WHERE id = $2 AND status = 'pending' 
       RETURNING *`,
      [`DIRECT${Date.now()}`, paymentId]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Payment ${paymentId} updated successfully`);
      res.json({
        success: true,
        message: 'Payment updated successfully',
        payment: result.rows[0]
      });
    } else {
      res.status(404).json({ error: 'Payment not found or not pending' });
    }
  } catch (error) {
    console.error('❌ Error in direct update:', error);
    res.status(500).json({ error: 'Error updating payment', details: error.message });
  }
});

// ✅ Simple payment status update test
app.post("/api/test/update-payment-status/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  
  try {
    console.log(`🧪 Updating payment ${paymentId} status to success...`);
    
    // Get the payment
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND status = $2',
      [paymentId, 'pending']
    );
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    const mpesaTransactionId = `TEST${Date.now()}`;
    
    // Update payment to success
    const updateResult = await pool.query(
      'UPDATE payments SET status=$1, payment_time=NOW(), mpesa_transaction_id=$2 WHERE id=$3 RETURNING *',
      ['success', mpesaTransactionId, paymentId]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Payment ${paymentId} updated to success`);
      res.json({
        success: true,
        message: 'Payment status updated to success',
        payment: updateResult.rows[0]
      });
    } else {
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({ error: 'Error updating payment status' });
  }
});

// ✅ Test M-Pesa callback simulation
app.post("/api/test/simulate-callback", async (req, res) => {
  try {
    console.log('🧪 Simulating M-Pesa callback...');
    
    // Simulate a successful callback for matatu 6
    const mockCallbackData = {
      Body: {
        stkCallback: {
          ResultCode: 0, // 0 = success
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 1.00 },
              { Name: "PhoneNumber", Value: "254727893741" },
              { Name: "MpesaReceiptNumber", Value: `SIM${Date.now()}` }
            ]
          }
        }
      }
    };
    
    // Process the callback
    const items = mockCallbackData.Body.stkCallback.CallbackMetadata.Item;
    const resultCode = mockCallbackData.Body.stkCallback.ResultCode;
    const amount = items.find((i) => i.Name === "Amount")?.Value;
    const phone = items.find((i) => i.Name === "PhoneNumber")?.Value;
    const mpesaTransactionId = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
    
    console.log(`📱 Simulated callback: Phone: ${phone}, Amount: ${amount}, Result: ${resultCode}`);
    
    if (resultCode === 0) {
      // Payment successful - update payment status
      const updateResult = await pool.query(
        "UPDATE payments SET status='success', payment_time=NOW(), mpesa_transaction_id=$3 WHERE phone=$1 AND amount=$2 AND status='pending' RETURNING *",
        [phone, amount, mpesaTransactionId]
      );
      
      if (updateResult.rows.length > 0) {
        const payment = updateResult.rows[0];
        console.log(`✅ Payment updated to success: ${payment.id}`);
        
        // Automatically credit payment to matatu wallet
        console.log(`💰 Auto-crediting payment to matatu wallet...`);
        const walletResult = await creditPaymentToMatatuWallet({
          matatuId: payment.matatu_id,
          amount: parseFloat(amount),
          phone: phone,
          mpesaTransactionId: mpesaTransactionId
        });
        
        if (walletResult.success) {
          console.log(`✅ Payment automatically credited to matatu wallet: ${walletResult.newBalance}`);
          res.json({
            success: true,
            message: 'Callback simulated successfully',
            payment: payment,
            walletBalance: walletResult.newBalance
          });
        } else {
          console.error(`❌ Failed to credit payment to wallet: ${walletResult.error}`);
          res.status(500).json({
            success: false,
            error: 'Failed to credit payment to wallet',
            details: walletResult.error
          });
        }
      } else {
        console.log('⚠️ No pending payment found to update');
        res.status(404).json({ error: 'No pending payment found' });
      }
    } else {
      res.status(400).json({ error: 'Simulated callback failed' });
    }
  } catch (error) {
    console.error('❌ Error simulating callback:', error);
    res.status(500).json({ error: 'Error simulating callback' });
  }
});

// ✅ Manual payment completion endpoint (for testing)
app.post("/api/test/complete-payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  
  try {
    console.log(`🧪 Manually completing payment ${paymentId} for testing...`);
    
    // Get the payment
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND status = $2',
      [paymentId, 'pending']
    );
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    const mpesaTransactionId = `TEST${Date.now()}`;
    
    // Update payment to success
    const updateResult = await pool.query(
      'UPDATE payments SET status=$1, payment_time=NOW(), mpesa_transaction_id=$2 WHERE id=$3 RETURNING *',
      ['success', mpesaTransactionId, paymentId]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Payment ${paymentId} updated to success`);
      
      // Credit to matatu wallet
      const walletResult = await creditPaymentToMatatuWallet({
        matatuId: payment.matatu_id,
        amount: parseFloat(payment.amount),
        phone: payment.phone,
        mpesaTransactionId: mpesaTransactionId
      });
      
      if (walletResult.success) {
        console.log(`✅ Payment credited to matatu wallet: ${walletResult.newBalance}`);
        res.json({
          success: true,
          message: 'Payment completed and credited to wallet',
          payment: updateResult.rows[0],
          walletBalance: walletResult.newBalance
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to credit payment to wallet',
          details: walletResult.error
        });
      }
    } else {
      res.status(500).json({ error: 'Failed to update payment status' });
    }
  } catch (error) {
    console.error('❌ Error completing payment:', error);
    res.status(500).json({ error: 'Error completing payment' });
  }
});

// ✅ Recalculate wallet balances endpoint
app.post("/api/wallet/recalculate", async (req, res) => {
  try {
    console.log('🔄 Manual wallet balance recalculation requested');
    const result = await recalculateWalletBalances();
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Wallet balances recalculated successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Error recalculating wallet balances:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to recalculate wallet balances' 
    });
  }
});

// ✅ All transactions endpoint - shows all transactions with statuses
app.get("/api/transactions", async (req, res) => {
  const { limit = 50, offset = 0, status, matatuId, customerId } = req.query;
  
  try {
    let query = `
      SELECT 
        p.id,
        p.phone,
        p.amount,
        p.status,
        p.created_at,
        p.payment_time,
        p.mpesa_transaction_id,
        p.wallet_credited,
        c.name as customer_name,
        c.email as customer_email,
        m.id as matatu_id,
        m.route_name,
        s.name as sacco_name,
        wt.id as wallet_transaction_id,
        wt.transaction_type as wallet_transaction_type,
        wt.description as wallet_description,
        wt.created_at as wallet_created_at
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN matatus m ON p.matatu_id = m.id
      LEFT JOIN saccos s ON m.sacco_id = s.id
      LEFT JOIN wallet_transactions wt ON p.mpesa_transaction_id = wt.reference_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;
    
    if (status) {
      query += ` AND p.status = $${++paramCount}`;
      queryParams.push(status);
    }
    
    if (matatuId) {
      query += ` AND p.matatu_id = $${++paramCount}`;
      queryParams.push(matatuId);
    }
    
    if (customerId) {
      query += ` AND p.customer_id = $${++paramCount}`;
      queryParams.push(customerId);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, queryParams);
    
    // Get transaction counts by status
    const countsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM payments 
      GROUP BY status
    `;
    const countsResult = await pool.query(countsQuery);
    
    const statusCounts = countsResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
    
    res.json({
      transactions: result.rows,
      statusCounts,
      total: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// ✅ Transaction statistics endpoint
app.get("/api/transactions/stats", async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount END), 0) as total_amount,
        COALESCE(AVG(CASE WHEN status = 'success' THEN amount END), 0) as average_amount,
        COUNT(CASE WHEN wallet_credited = true THEN 1 END) as wallet_credited_count
      FROM payments
    `;
    
    const result = await pool.query(statsQuery);
    const stats = result.rows[0];
    
    // Get daily transaction counts for the last 7 days
    const dailyQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_count,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount END), 0) as daily_amount
      FROM payments 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const dailyResult = await pool.query(dailyQuery);
    
    res.json({
      ...stats,
      dailyTransactions: dailyResult.rows
    });
  } catch (error) {
    console.error('❌ Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Error fetching transaction stats' });
  }
});

// ✅ Admin routes
// ✅ Admin routes with specific CORS handling
app.use("/api/admin", (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://lipa-nganya-admin.onrender.com",
    "http://localhost:5176",
    "http://127.0.0.1:5176"
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use("/api/admin", adminRoutes);

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
