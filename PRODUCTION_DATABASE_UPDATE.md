# Production Database Update Guide

## 🚀 Updating Render Production Database

The production database on Render is missing the `drivers` table and wallet tables. Here's how to update it:

### Method 1: Run Update Script on Render (Recommended)

#### Step 1: Deploy the Update Script
The `updateProductionDatabase.js` script has been created and added to the repository. It will:
- Create the `drivers` table
- Create wallet tables (`matatu_wallets`, `driver_wallets`, `conductor_wallets`, `wallet_transactions`)
- Add sample drivers and conductors
- Create wallet balances
- Add sample transactions

#### Step 2: Run on Render
1. **Go to your Render dashboard**
2. **Find your backend service** (`lipa-nganya-api`)
3. **Go to the "Shell" tab** (or use Render's web shell)
4. **Run the update command:**
   ```bash
   npm run update-prod-db
   ```

#### Step 3: Verify Update
The script will output:
```
🚀 Starting production database update...
✅ Connected to production database
🔧 Creating drivers table...
✅ Drivers table created/verified
💰 Creating wallet tables...
✅ Wallet tables created/verified
👨‍💼 Creating sample drivers and conductors...
✅ Sample drivers and conductors created
💰 Creating matatu wallets...
💰 Creating driver wallets...
💰 Creating conductor wallets...
💰 Creating sample wallet transactions...
🎉 Production database update completed successfully!
```

### Method 2: Manual Database Update (Alternative)

If you prefer to update manually, you can run these SQL commands in your Render database:

#### Create Drivers Table
```sql
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  matatu_id INTEGER REFERENCES matatus(id),
  pin VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Create Wallet Tables
```sql
-- Matatu Wallets
CREATE TABLE IF NOT EXISTS matatu_wallets (
  id SERIAL PRIMARY KEY,
  matatu_id INTEGER UNIQUE REFERENCES matatus(id),
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver Wallets
CREATE TABLE IF NOT EXISTS driver_wallets (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER UNIQUE REFERENCES drivers(id),
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conductor Wallets
CREATE TABLE IF NOT EXISTS conductor_wallets (
  id SERIAL PRIMARY KEY,
  conductor_id INTEGER UNIQUE REFERENCES drivers(id),
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions
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
);
```

#### Add Sample Data
```sql
-- Sample Drivers and Conductors
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
ON CONFLICT (phone) DO NOTHING;
```

### Method 3: Local Update (If you have direct database access)

If you have direct access to your production database:

```bash
# From your local machine
cd backend
npm run update-prod-db
```

### Test Credentials After Update

Once the database is updated, you can test with these credentials:

#### Driver Login:
- **Phone**: `254708374153`
- **PIN**: `1234`
- **Role**: Driver (sees Matatu + Driver wallets)

#### Conductor Login:
- **Phone**: `254708374158`
- **PIN**: `1111`
- **Role**: Conductor (sees Matatu + Conductor wallets)

### Verification

After running the update, verify the tables exist by checking:

1. **Driver app login** should work
2. **Wallet balances** should display
3. **Transaction history** should show sample data
4. **Role-based access** should work correctly

### Troubleshooting

#### If the script fails:
1. Check Render logs for specific errors
2. Ensure database connection is working
3. Verify environment variables are set correctly
4. Check if tables already exist (script handles conflicts)

#### If manual update fails:
1. Check foreign key constraints
2. Ensure `matatus` table exists first
3. Verify database permissions
4. Check for existing data conflicts

### Next Steps

After updating the production database:
1. **Test driver app** with provided credentials
2. **Verify wallet functionality** works correctly
3. **Check transaction history** displays properly
4. **Confirm role-based access** works as expected

The production database will then be fully synchronized with your local development environment! 🎉
