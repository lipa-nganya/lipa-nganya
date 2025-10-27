import pool from './config/db.js';

// Sample data for seeding the database
const sampleData = {
  saccos: [
    { name: 'KBS Sacco' },
    { name: 'City Hoppa' },
    { name: 'Metro Trans' },
    { name: 'Easy Coach' }
  ],
  
  matatus: [
    { route_name: 'CBD to Westlands', sacco_id: 1 },
    { route_name: 'CBD to Eastleigh', sacco_id: 2 },
    { route_name: 'CBD to Karen', sacco_id: 1 },
    { route_name: 'CBD to Thika', sacco_id: 3 },
    { route_name: 'CBD to Rongai', sacco_id: 4 }
  ],
  
  drivers: [
    { name: 'John Kamau', phone: '254708374153', role: 'driver', matatu_id: 1, pin: '1234' },
    { name: 'Mary Wanjiku', phone: '254708374154', role: 'driver', matatu_id: 2, pin: '5678' },
    { name: 'Peter Mwangi', phone: '254708374155', role: 'driver', matatu_id: 3, pin: '9012' },
    { name: 'Grace Akinyi', phone: '254708374156', role: 'driver', matatu_id: 4, pin: '3456' },
    { name: 'David Ochieng', phone: '254708374157', role: 'driver', matatu_id: 5, pin: '7890' }
  ],
  
  conductors: [
    { name: 'James Mutua', phone: '254708374158', role: 'conductor', matatu_id: 1, pin: '1111' },
    { name: 'Sarah Njeri', phone: '254708374159', role: 'conductor', matatu_id: 2, pin: '2222' },
    { name: 'Michael Kiprop', phone: '254708374160', role: 'conductor', matatu_id: 3, pin: '3333' },
    { name: 'Esther Wambui', phone: '254708374161', role: 'conductor', matatu_id: 4, pin: '4444' },
    { name: 'Samuel Otieno', phone: '254708374162', role: 'conductor', matatu_id: 5, pin: '5555' }
  ],
  
  customers: [
    { name: 'Alice Muthoni', phone: '254708374163', email: 'alice@example.com' },
    { name: 'Brian Kipchoge', phone: '254708374164', email: 'brian@example.com' },
    { name: 'Catherine Wanjala', phone: '254708374165', email: 'catherine@example.com' },
    { name: 'Daniel Mwangi', phone: '254708374166', email: 'daniel@example.com' },
    { name: 'Eunice Chebet', phone: '254708374167', email: 'eunice@example.com' },
    { name: 'Francis Omondi', phone: '254708374168', email: 'francis@example.com' },
    { name: 'Grace Akoth', phone: '254708374169', email: 'grace@example.com' },
    { name: 'Henry Kimani', phone: '254708374170', email: 'henry@example.com' }
  ],
  
  payments: [
    { customer_id: 1, matatu_id: 1, amount: 50, phone: '254708374163', mpesa_transaction_id: 'MPE001', status: 'completed' },
    { customer_id: 2, matatu_id: 1, amount: 50, phone: '254708374164', mpesa_transaction_id: 'MPE002', status: 'completed' },
    { customer_id: 3, matatu_id: 2, amount: 50, phone: '254708374165', mpesa_transaction_id: 'MPE003', status: 'completed' },
    { customer_id: 4, matatu_id: 2, amount: 50, phone: '254708374166', mpesa_transaction_id: 'MPE004', status: 'completed' },
    { customer_id: 5, matatu_id: 3, amount: 50, phone: '254708374167', mpesa_transaction_id: 'MPE005', status: 'completed' },
    { customer_id: 6, matatu_id: 3, amount: 50, phone: '254708374168', mpesa_transaction_id: 'MPE006', status: 'completed' },
    { customer_id: 7, matatu_id: 4, amount: 50, phone: '254708374169', mpesa_transaction_id: 'MPE007', status: 'completed' },
    { customer_id: 8, matatu_id: 4, amount: 50, phone: '254708374170', mpesa_transaction_id: 'MPE008', status: 'completed' },
    { customer_id: 1, matatu_id: 1, amount: 50, phone: '254708374163', mpesa_transaction_id: 'MPE009', status: 'completed' },
    { customer_id: 2, matatu_id: 1, amount: 50, phone: '254708374164', mpesa_transaction_id: 'MPE010', status: 'completed' },
    { customer_id: 3, matatu_id: 2, amount: 50, phone: '254708374165', mpesa_transaction_id: 'MPE011', status: 'completed' },
    { customer_id: 4, matatu_id: 2, amount: 50, phone: '254708374166', mpesa_transaction_id: 'MPE012', status: 'completed' },
    { customer_id: 5, matatu_id: 3, amount: 50, phone: '254708374167', mpesa_transaction_id: 'MPE013', status: 'completed' },
    { customer_id: 6, matatu_id: 3, amount: 50, phone: '254708374168', mpesa_transaction_id: 'MPE014', status: 'completed' },
    { customer_id: 7, matatu_id: 4, amount: 50, phone: '254708374169', mpesa_transaction_id: 'MPE015', status: 'completed' },
    { customer_id: 8, matatu_id: 4, amount: 50, phone: '254708374170', mpesa_transaction_id: 'MPE016', status: 'completed' }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create drivers table if it doesn't exist
    console.log('🔧 Creating drivers table if needed...');
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
        wallet_type VARCHAR(20) NOT NULL, -- 'matatu', 'driver', 'conductor'
        wallet_id INTEGER NOT NULL,
        transaction_type VARCHAR(50) NOT NULL, -- 'payment_received', 'fuel_payment', 'sacco_payment', 'owner_payment', 'withdrawal', 'transfer'
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        reference_id VARCHAR(100), -- M-Pesa transaction ID or other reference
        created_by INTEGER REFERENCES drivers(id), -- Who initiated the transaction
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Clear existing data in correct order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await pool.query('DELETE FROM wallet_transactions');
    await pool.query('DELETE FROM conductor_wallets');
    await pool.query('DELETE FROM driver_wallets');
    await pool.query('DELETE FROM matatu_wallets');
    await pool.query('DELETE FROM ratings');
    await pool.query('DELETE FROM payments');
    await pool.query('DELETE FROM customers');
    await pool.query('DELETE FROM drivers');
    await pool.query('DELETE FROM matatus');
    await pool.query('DELETE FROM saccos');
    
    // Reset sequences
    await pool.query('ALTER SEQUENCE saccos_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE matatus_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE drivers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE customers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE payments_id_seq RESTART WITH 1');
    
    // Insert saccos
    console.log('🏢 Inserting saccos...');
    for (const sacco of sampleData.saccos) {
      await pool.query(
        'INSERT INTO saccos (name) VALUES ($1)',
        [sacco.name]
      );
    }
    
    // Insert matatus
    console.log('🚐 Inserting matatus...');
    for (const matatu of sampleData.matatus) {
      await pool.query(
        'INSERT INTO matatus (route_name, sacco_id) VALUES ($1, $2)',
        [matatu.route_name, matatu.sacco_id]
      );
    }
    
    // Insert drivers
    console.log('👨‍💼 Inserting drivers...');
    for (const driver of sampleData.drivers) {
      await pool.query(
        'INSERT INTO drivers (name, phone, role, matatu_id, pin) VALUES ($1, $2, $3, $4, $5)',
        [driver.name, driver.phone, driver.role, driver.matatu_id, driver.pin]
      );
    }
    
    // Insert conductors
    console.log('👩‍💼 Inserting conductors...');
    for (const conductor of sampleData.conductors) {
      await pool.query(
        'INSERT INTO drivers (name, phone, role, matatu_id, pin) VALUES ($1, $2, $3, $4, $5)',
        [conductor.name, conductor.phone, conductor.role, conductor.matatu_id, conductor.pin]
      );
    }
    
    // Create wallets for matatus
    console.log('💰 Creating matatu wallets...');
    for (let i = 1; i <= 5; i++) {
      await pool.query(
        'INSERT INTO matatu_wallets (matatu_id, balance) VALUES ($1, $2)',
        [i, Math.floor(Math.random() * 20000) + 5000] // Random balance between 5000-25000
      );
    }
    
    // Create wallets for drivers
    console.log('💰 Creating driver wallets...');
    const driverResult = await pool.query('SELECT id FROM drivers WHERE role = $1', ['driver']);
    for (const driver of driverResult.rows) {
      await pool.query(
        'INSERT INTO driver_wallets (driver_id, balance) VALUES ($1, $2)',
        [driver.id, Math.floor(Math.random() * 5000) + 1000] // Random balance between 1000-6000
      );
    }
    
    // Create wallets for conductors
    console.log('💰 Creating conductor wallets...');
    const conductorResult = await pool.query('SELECT id FROM drivers WHERE role = $1', ['conductor']);
    for (const conductor of conductorResult.rows) {
      await pool.query(
        'INSERT INTO conductor_wallets (conductor_id, balance) VALUES ($1, $2)',
        [conductor.id, Math.floor(Math.random() * 3000) + 500] // Random balance between 500-3500
      );
    }
    
    // Create sample wallet transactions
    console.log('💰 Creating sample wallet transactions...');
    const sampleTransactions = [
      { wallet_type: 'matatu', wallet_id: 1, transaction_type: 'payment_received', amount: 50, description: 'Customer fare payment', reference_id: 'MPE001', created_by: 1 },
      { wallet_type: 'matatu', wallet_id: 1, transaction_type: 'fuel_payment', amount: -2000, description: 'Fuel payment', reference_id: 'FUEL001', created_by: 1 },
      { wallet_type: 'driver', wallet_id: 1, transaction_type: 'transfer', amount: 500, description: 'Daily allowance', reference_id: 'TRANS001', created_by: 1 },
      { wallet_type: 'conductor', wallet_id: 1, transaction_type: 'transfer', amount: 300, description: 'Daily allowance', reference_id: 'TRANS002', created_by: 1 },
      { wallet_type: 'matatu', wallet_id: 2, transaction_type: 'payment_received', amount: 50, description: 'Customer fare payment', reference_id: 'MPE002', created_by: 2 },
      { wallet_type: 'matatu', wallet_id: 2, transaction_type: 'sacco_payment', amount: -1000, description: 'Sacco contribution', reference_id: 'SACCO001', created_by: 2 }
    ];
    
    for (const transaction of sampleTransactions) {
      await pool.query(
        'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [transaction.wallet_type, transaction.wallet_id, transaction.transaction_type, transaction.amount, transaction.description, transaction.reference_id, transaction.created_by]
      );
    }
    
    // Insert customers
    console.log('👥 Inserting customers...');
    for (const customer of sampleData.customers) {
      await pool.query(
        'INSERT INTO customers (name, phone, email) VALUES ($1, $2, $3)',
        [customer.name, customer.phone, customer.email]
      );
    }
    
    // Insert payments
    console.log('💰 Inserting payments...');
    for (const payment of sampleData.payments) {
      await pool.query(
        'INSERT INTO payments (customer_id, matatu_id, amount, phone, mpesa_transaction_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [payment.customer_id, payment.matatu_id, payment.amount, payment.phone, payment.mpesa_transaction_id, payment.status]
      );
    }
    
    console.log('✅ Database seeding completed successfully!');
    
    // Display summary
    const saccoCount = await pool.query('SELECT COUNT(*) FROM saccos');
    const matatuCount = await pool.query('SELECT COUNT(*) FROM matatus');
    const driverCount = await pool.query('SELECT COUNT(*) FROM drivers');
    const customerCount = await pool.query('SELECT COUNT(*) FROM customers');
    const paymentCount = await pool.query('SELECT COUNT(*) FROM payments');
    const matatuWalletCount = await pool.query('SELECT COUNT(*) FROM matatu_wallets');
    const driverWalletCount = await pool.query('SELECT COUNT(*) FROM driver_wallets');
    const conductorWalletCount = await pool.query('SELECT COUNT(*) FROM conductor_wallets');
    const transactionCount = await pool.query('SELECT COUNT(*) FROM wallet_transactions');
    
    console.log('\n📊 Database Summary:');
    console.log(`🏢 Saccos: ${saccoCount.rows[0].count}`);
    console.log(`🚐 Matatus: ${matatuCount.rows[0].count}`);
    console.log(`👨‍💼 Drivers: ${driverCount.rows[0].count}`);
    console.log(`👥 Customers: ${customerCount.rows[0].count}`);
    console.log(`💰 Payments: ${paymentCount.rows[0].count}`);
    console.log(`🏦 Matatu Wallets: ${matatuWalletCount.rows[0].count}`);
    console.log(`👨‍💼 Driver Wallets: ${driverWalletCount.rows[0].count}`);
    console.log(`👩‍💼 Conductor Wallets: ${conductorWalletCount.rows[0].count}`);
    console.log(`📝 Wallet Transactions: ${transactionCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
