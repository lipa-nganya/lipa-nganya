import pool from "../config/db.js";

export const getCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Create or find customer by phone number
export const createOrFindCustomer = async (req, res) => {
  const { phone, name, email } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    // First, try to find existing customer by phone
    let result = await pool.query(
      "SELECT * FROM customers WHERE phone = $1",
      [phone]
    );

    if (result.rows.length > 0) {
      // Customer exists, update name if provided (skip email for production compatibility)
      if (name) {
        try {
          const updateQuery = `
            UPDATE customers 
            SET name = $2,
                updated_at = NOW()
            WHERE phone = $1
            RETURNING *
          `;
          result = await pool.query(updateQuery, [phone, name]);
        } catch (updateError) {
          console.error("❌ Error updating customer:", updateError.message);
          // If update fails, just return existing customer
        }
      }
      return res.json({ 
        customer: result.rows[0], 
        isNew: false,
        message: "Customer found and updated" 
      });
    } else {
      // Create new customer (without email for production compatibility)
      try {
        const insertQuery = `
          INSERT INTO customers (phone, name) 
          VALUES ($1, $2) 
          RETURNING *
        `;
        result = await pool.query(insertQuery, [phone, name || `Customer ${phone}`]);
      } catch (insertError) {
        console.error("❌ Error inserting customer:", insertError.message);
        // Try with email column if it exists
        const insertQueryWithEmail = `
          INSERT INTO customers (phone, name, email) 
          VALUES ($1, $2, $3) 
          RETURNING *
        `;
        result = await pool.query(insertQueryWithEmail, [phone, name || `Customer ${phone}`, email || null]);
      }
      
      return res.status(201).json({ 
        customer: result.rows[0], 
        isNew: true,
        message: "Customer created successfully" 
      });
    }
  } catch (err) {
    console.error("Error creating/finding customer:", err);
    res.status(500).json({ error: "Failed to create/find customer" });
  }
};

// ✅ Get customer payment history
export const getCustomerPayments = async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    return res.status(400).json({ error: "Customer ID is required" });
  }

  try {
    const query = `
      SELECT 
        p.id,
        p.amount,
        p.phone,
        p.status,
        p.payment_time,
        p.created_at,
        m.route_name,
        s.name as sacco_name
      FROM payments p
      LEFT JOIN matatus m ON p.matatu_id = m.id
      LEFT JOIN saccos s ON m.sacco_id = s.id
      WHERE p.customer_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, [customerId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customer payments:", err);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// ✅ Verify Google token and get user info
export const verifyGoogleToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Google token is required" });
  }

  try {
    // Check if it's a mock token (for development)
    if (token.startsWith("mock_credential_")) {
      const userInfo = {
        id: "google_" + Date.now(),
        email: "user@gmail.com",
        name: "Google User",
        verified: true
      };
      return res.json({ user: userInfo });
    }

    // TODO: Implement real Google token verification
    // You'll need to install: npm install google-auth-library
    // Then verify the token with Google's API
    
    // For now, return mock data
    const userInfo = {
      id: "google_" + Date.now(),
      email: "user@gmail.com", 
      name: "Google User",
      verified: true
    };

    res.json({ user: userInfo });
  } catch (err) {
    console.error("Error verifying Google token:", err);
    res.status(500).json({ error: "Failed to verify Google token" });
  }
};
