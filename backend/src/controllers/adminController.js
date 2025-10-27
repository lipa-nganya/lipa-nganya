import pool from '../config/db.js';

// Admin authentication (simple for now)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // In production, use proper authentication
};

// Admin login
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  console.log(`🔐 Admin login attempt: ${username}`);

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    console.log('✅ Admin login successful');
    res.json({
      success: true,
      message: 'Admin login successful',
      admin: { username: username }
    });
  } else {
    console.log('❌ Admin login failed');
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
};

// Get all saccos
export const getAllSaccos = async (req, res) => {
  try {
    console.log('🔍 Fetching all saccos...');
    const result = await pool.query('SELECT * FROM saccos ORDER BY name');
    console.log(`✅ Found ${result.rows.length} saccos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching saccos:', error);
    res.status(500).json({ error: 'Failed to fetch saccos' });
  }
};

// Create new sacco
export const createSacco = async (req, res) => {
  const { name } = req.body;

  console.log(`🏢 Creating sacco: ${name}`);

  if (!name) {
    return res.status(400).json({ error: 'Sacco name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO saccos (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    console.log('✅ Sacco created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating sacco:', error);
    res.status(500).json({ error: 'Failed to create sacco' });
  }
};

// Get all matatus with sacco info
export const getAllMatatus = async (req, res) => {
  try {
    console.log('🔍 Fetching all matatus...');
    const result = await pool.query(`
      SELECT m.*, s.name as sacco_name 
      FROM matatus m 
      LEFT JOIN saccos s ON m.sacco_id = s.id 
      ORDER BY m.route_name
    `);
    console.log(`✅ Found ${result.rows.length} matatus`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching matatus:', error);
    res.status(500).json({ error: 'Failed to fetch matatus' });
  }
};

// Create new matatu
export const createMatatu = async (req, res) => {
  const { route_name, sacco_id } = req.body;

  console.log(`🚐 Creating matatu: ${route_name} for sacco ${sacco_id}`);

  if (!route_name || !sacco_id) {
    return res.status(400).json({ error: 'Route name and sacco ID are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO matatus (route_name, sacco_id) VALUES ($1, $2) RETURNING *',
      [route_name, sacco_id]
    );
    
    console.log('✅ Matatu created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating matatu:', error);
    res.status(500).json({ error: 'Failed to create matatu' });
  }
};

// Get all drivers with matatu info
export const getAllDrivers = async (req, res) => {
  try {
    console.log('🔍 Fetching all drivers and conductors...');
    const result = await pool.query(`
      SELECT d.*, m.route_name, s.name as sacco_name
      FROM drivers d 
      LEFT JOIN matatus m ON d.matatu_id = m.id 
      LEFT JOIN saccos s ON m.sacco_id = s.id
      ORDER BY d.role, d.name
    `);
    console.log(`✅ Found ${result.rows.length} drivers/conductors`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

// Create new driver/conductor
export const createDriver = async (req, res) => {
  const { name, phone, role, matatu_id, pin } = req.body;

  console.log(`👨‍💼 Creating ${role}: ${name} for matatu ${matatu_id}`);

  if (!name || !phone || !role || !matatu_id) {
    return res.status(400).json({ error: 'Name, phone, role, and matatu ID are required' });
  }

  if (!['driver', 'conductor'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either "driver" or "conductor"' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO drivers (name, phone, role, matatu_id, pin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, phone, role, matatu_id, pin || '0000']
    );
    
    // Create wallet for the new driver/conductor
    if (role === 'driver') {
      await pool.query(
        'INSERT INTO driver_wallets (driver_id, balance) VALUES ($1, $2)',
        [result.rows[0].id, 0]
      );
    } else if (role === 'conductor') {
      await pool.query(
        'INSERT INTO conductor_wallets (conductor_id, balance) VALUES ($1, $2)',
        [result.rows[0].id, 0]
      );
    }
    
    console.log('✅ Driver/Conductor created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creating driver/conductor:', error);
    res.status(500).json({ error: 'Failed to create driver/conductor' });
  }
};

// Update driver/conductor
export const updateDriver = async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, matatu_id, pin } = req.body;

  console.log(`👨‍💼 Updating driver/conductor ${id}`);

  try {
    const result = await pool.query(
      'UPDATE drivers SET name = $1, phone = $2, role = $3, matatu_id = $4, pin = $5 WHERE id = $6 RETURNING *',
      [name, phone, role, matatu_id, pin, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver/conductor not found' });
    }
    
    console.log('✅ Driver/Conductor updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating driver/conductor:', error);
    res.status(500).json({ error: 'Failed to update driver/conductor' });
  }
};

// Delete driver/conductor
export const deleteDriver = async (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ Deleting driver/conductor ${id}`);

  try {
    // First delete associated wallet
    const driverResult = await pool.query('SELECT role FROM drivers WHERE id = $1', [id]);
    if (driverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Driver/conductor not found' });
    }

    const role = driverResult.rows[0].role;
    if (role === 'driver') {
      await pool.query('DELETE FROM driver_wallets WHERE driver_id = $1', [id]);
    } else if (role === 'conductor') {
      await pool.query('DELETE FROM conductor_wallets WHERE conductor_id = $1', [id]);
    }

    // Then delete the driver/conductor
    await pool.query('DELETE FROM drivers WHERE id = $1', [id]);
    
    console.log('✅ Driver/Conductor deleted');
    res.json({ message: 'Driver/conductor deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting driver/conductor:', error);
    res.status(500).json({ error: 'Failed to delete driver/conductor' });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const [saccosCount, matatusCount, driversCount, conductorsCount, customersCount, paymentsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM saccos'),
      pool.query('SELECT COUNT(*) FROM matatus'),
      pool.query('SELECT COUNT(*) FROM drivers WHERE role = $1', ['driver']),
      pool.query('SELECT COUNT(*) FROM drivers WHERE role = $1', ['conductor']),
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query('SELECT COUNT(*) FROM payments WHERE status = $1', ['success'])
    ]);

    const stats = {
      saccos: parseInt(saccosCount.rows[0].count),
      matatus: parseInt(matatusCount.rows[0].count),
      drivers: parseInt(driversCount.rows[0].count),
      conductors: parseInt(conductorsCount.rows[0].count),
      customers: parseInt(customersCount.rows[0].count),
      completedPayments: parseInt(paymentsCount.rows[0].count)
    };

    console.log('✅ Dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
