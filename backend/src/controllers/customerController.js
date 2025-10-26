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
      // Customer exists, update name and email if provided
      if (name || email) {
        const updateQuery = `
          UPDATE customers 
          SET name = COALESCE($2, name), 
              email = COALESCE($3, email),
              updated_at = NOW()
          WHERE phone = $1
          RETURNING *
        `;
        result = await pool.query(updateQuery, [phone, name, email]);
      }
      return res.json({ 
        customer: result.rows[0], 
        isNew: false,
        message: "Customer found and updated" 
      });
    } else {
      // Create new customer
      const insertQuery = `
        INSERT INTO customers (phone, name, email) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;
      result = await pool.query(insertQuery, [phone, name || null, email || null]);
      
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
    // For now, we'll just return the token info
    // In production, you'd verify this with Google's API
    const userInfo = {
      id: "google_" + Date.now(), // Temporary ID
      email: "user@example.com", // This would come from Google
      name: "Google User", // This would come from Google
      verified: true
    };

    res.json({ user: userInfo });
  } catch (err) {
    console.error("Error verifying Google token:", err);
    res.status(500).json({ error: "Failed to verify Google token" });
  }
};
