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
    
    // Clear existing data in correct order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
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
    
    console.log('\n📊 Database Summary:');
    console.log(`🏢 Saccos: ${saccoCount.rows[0].count}`);
    console.log(`🚐 Matatus: ${matatuCount.rows[0].count}`);
    console.log(`👨‍💼 Drivers: ${driverCount.rows[0].count}`);
    console.log(`👥 Customers: ${customerCount.rows[0].count}`);
    console.log(`💰 Payments: ${paymentCount.rows[0].count}`);
    
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
