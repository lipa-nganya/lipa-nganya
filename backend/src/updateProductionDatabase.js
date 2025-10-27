import pool from './config/db.js';

// Production database update script for Render
// This script creates missing tables and adds sample data

async function updateProductionDatabase() {
  console.log('🚀 Starting production database update...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to production database');
    
    // Create drivers table if it doesn't exist
    console.log('🔧 Creating drivers table...');
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
    console.log('✅ Drivers table created/verified');
    
    // Create wallet tables
    console.log('💰 Creating wallet tables...');
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
    console.log('✅ Wallet tables created/verified');
    
    // Check if we have matatus to work with
    const matatusResult = await pool.query('SELECT * FROM matatus LIMIT 1');
    if (matatusResult.rows.length === 0) {
      console.log('⚠️ No matatus found. Creating sample matatus first...');
      
      // Create sample saccos
      await pool.query(`
        INSERT INTO saccos (name) VALUES 
        ('KBS Sacco'), ('City Hoppa'), ('Metro Trans'), ('Easy Coach')
        ON CONFLICT DO NOTHING
      `);
      
      // Create sample matatus
      await pool.query(`
        INSERT INTO matatus (route_name, sacco_id) VALUES 
        ('CBD to Westlands', 1),
        ('CBD to Eastleigh', 2),
        ('CBD to Karen', 1),
        ('CBD to Thika', 3),
        ('CBD to Rongai', 4)
        ON CONFLICT DO NOTHING
      `);
      console.log('✅ Sample matatus created');
    }
    
    // Check if drivers exist
    const driversResult = await pool.query('SELECT COUNT(*) FROM drivers');
    const driverCount = parseInt(driversResult.rows[0].count);
    
    if (driverCount === 0) {
      console.log('👨‍💼 Creating sample drivers and conductors...');
      
      // Create sample drivers and conductors
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
      console.log('✅ Sample drivers and conductors created');
    } else {
      console.log(`✅ Found ${driverCount} existing drivers/conductors`);
    }
    
    // Create wallets for matatus
    console.log('💰 Creating matatu wallets...');
    const matatus = await pool.query('SELECT id FROM matatus');
    for (const matatu of matatus.rows) {
      await pool.query(
        'INSERT INTO matatu_wallets (matatu_id, balance) VALUES ($1, $2) ON CONFLICT (matatu_id) DO NOTHING',
        [matatu.id, Math.floor(Math.random() * 20000) + 5000]
      );
    }
    
    // Create wallets for drivers
    console.log('💰 Creating driver wallets...');
    const drivers = await pool.query('SELECT id FROM drivers WHERE role = $1', ['driver']);
    for (const driver of drivers.rows) {
      await pool.query(
        'INSERT INTO driver_wallets (driver_id, balance) VALUES ($1, $2) ON CONFLICT (driver_id) DO NOTHING',
        [driver.id, Math.floor(Math.random() * 5000) + 1000]
      );
    }
    
    // Create wallets for conductors
    console.log('💰 Creating conductor wallets...');
    const conductors = await pool.query('SELECT id FROM drivers WHERE role = $1', ['conductor']);
    for (const conductor of conductors.rows) {
      await pool.query(
        'INSERT INTO conductor_wallets (conductor_id, balance) VALUES ($1, $2) ON CONFLICT (conductor_id) DO NOTHING',
        [conductor.id, Math.floor(Math.random() * 3000) + 500]
      );
    }
    
    // Create sample wallet transactions
    console.log('💰 Creating sample wallet transactions...');
    const sampleTransactions = [
      { wallet_type: 'matatu', wallet_id: 1, transaction_type: 'payment_received', amount: 50, description: 'Customer fare payment', reference_id: 'MPE001', created_by: 1 },
      { wallet_type: 'matatu', wallet_id: 1, transaction_type: 'fuel_payment', amount: -2000, description: 'Fuel payment', reference_id: 'FUEL001', created_by: 1 },
      { wallet_type: 'driver', wallet_id: 1, transaction_type: 'transfer', amount: 500, description: 'Daily allowance', reference_id: 'TRANS001', created_by: 1 },
      { wallet_type: 'conductor', wallet_id: 1, transaction_type: 'transfer', amount: 300, description: 'Daily allowance', reference_id: 'TRANS002', created_by: 1 }
    ];
    
    for (const transaction of sampleTransactions) {
      await pool.query(
        'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        [transaction.wallet_type, transaction.wallet_id, transaction.transaction_type, transaction.amount, transaction.description, transaction.reference_id, transaction.created_by]
      );
    }
    
    // Get final counts
    const [driversCount, matatuWalletsCount, driverWalletsCount, conductorWalletsCount, transactionsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM drivers'),
      pool.query('SELECT COUNT(*) FROM matatu_wallets'),
      pool.query('SELECT COUNT(*) FROM driver_wallets'),
      pool.query('SELECT COUNT(*) FROM conductor_wallets'),
      pool.query('SELECT COUNT(*) FROM wallet_transactions')
    ]);
    
    console.log('🎉 Production database update completed successfully!');
    console.log('📊 Final Database Summary:');
    console.log(`👨‍💼 Drivers/Conductors: ${driversCount.rows[0].count}`);
    console.log(`🏦 Matatu Wallets: ${matatuWalletsCount.rows[0].count}`);
    console.log(`👨‍💼 Driver Wallets: ${driverWalletsCount.rows[0].count}`);
    console.log(`👩‍💼 Conductor Wallets: ${conductorWalletsCount.rows[0].count}`);
    console.log(`📝 Wallet Transactions: ${transactionsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error updating production database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the update
updateProductionDatabase()
  .then(() => {
    console.log('✅ Production database update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Production database update failed:', error);
    process.exit(1);
  });
