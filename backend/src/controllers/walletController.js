import pool from '../config/db.js';

// Get wallet balances for a driver/conductor based on their role
export const getWalletBalances = async (req, res) => {
  const { driverId, role, matatuId } = req.body;

  console.log(`🔍 Getting wallet balances for ${role} ID: ${driverId}, matatu ID: ${matatuId}`);

  try {
    const wallets = {};

    // Always get matatu wallet balance
    const matatuWalletResult = await pool.query(
      'SELECT balance FROM matatu_wallets WHERE matatu_id = $1',
      [matatuId]
    );
    
    wallets.matatuWallet = matatuWalletResult.rows[0]?.balance || 0;

    // Get role-specific wallet balance
    if (role === 'driver') {
      const driverWalletResult = await pool.query(
        'SELECT balance FROM driver_wallets WHERE driver_id = $1',
        [driverId]
      );
      wallets.driverWallet = driverWalletResult.rows[0]?.balance || 0;
    } else if (role === 'conductor') {
      const conductorWalletResult = await pool.query(
        'SELECT balance FROM conductor_wallets WHERE conductor_id = $1',
        [driverId]
      );
      wallets.conductorWallet = conductorWalletResult.rows[0]?.balance || 0;
    }

    console.log(`✅ Wallet balances retrieved:`, wallets);
    res.json({
      success: true,
      wallets: wallets
    });

  } catch (error) {
    console.error(`❌ Error getting wallet balances:`, error);
    res.status(500).json({
      error: "Failed to get wallet balances"
    });
  }
};

// Get wallet transactions for a driver/conductor
export const getWalletTransactions = async (req, res) => {
  const { driverId, role, matatuId } = req.body;

  console.log(`🔍 Getting wallet transactions for ${role} ID: ${driverId}, matatu ID: ${matatuId}`);

  try {
    const transactions = [];

    // Get matatu wallet transactions
    const matatuTransactionsResult = await pool.query(
      `SELECT wt.*, d.name as created_by_name 
       FROM wallet_transactions wt 
       LEFT JOIN drivers d ON wt.created_by = d.id 
       WHERE wt.wallet_type = 'matatu' AND wt.wallet_id = (
         SELECT id FROM matatu_wallets WHERE matatu_id = $1
       )
       ORDER BY wt.created_at DESC LIMIT 10`,
      [matatuId]
    );

    transactions.push(...matatuTransactionsResult.rows.map(t => ({
      ...t,
      wallet_name: 'Matatu Wallet'
    })));

    // Get role-specific wallet transactions
    if (role === 'driver') {
      const driverTransactionsResult = await pool.query(
        `SELECT wt.*, d.name as created_by_name 
         FROM wallet_transactions wt 
         LEFT JOIN drivers d ON wt.created_by = d.id 
         WHERE wt.wallet_type = 'driver' AND wt.wallet_id = (
           SELECT id FROM driver_wallets WHERE driver_id = $1
         )
         ORDER BY wt.created_at DESC LIMIT 10`,
        [driverId]
      );

      transactions.push(...driverTransactionsResult.rows.map(t => ({
        ...t,
        wallet_name: 'Driver Wallet'
      })));
    } else if (role === 'conductor') {
      const conductorTransactionsResult = await pool.query(
        `SELECT wt.*, d.name as created_by_name 
         FROM wallet_transactions wt 
         LEFT JOIN drivers d ON wt.created_by = d.id 
         WHERE wt.wallet_type = 'conductor' AND wt.wallet_id = (
           SELECT id FROM conductor_wallets WHERE conductor_id = $1
         )
         ORDER BY wt.created_at DESC LIMIT 10`,
        [driverId]
      );

      transactions.push(...conductorTransactionsResult.rows.map(t => ({
        ...t,
        wallet_name: 'Conductor Wallet'
      })));
    }

    // Sort all transactions by date
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`✅ Found ${transactions.length} wallet transactions`);
    res.json({
      success: true,
      transactions: transactions.slice(0, 10) // Return latest 10
    });

  } catch (error) {
    console.error(`❌ Error getting wallet transactions:`, error);
    res.status(500).json({
      error: "Failed to get wallet transactions"
    });
  }
};

// Transfer money between wallets (for future use)
export const transferMoney = async (req, res) => {
  const { fromWalletType, fromWalletId, toWalletType, toWalletId, amount, description, createdBy } = req.body;

  console.log(`🔍 Transferring ${amount} from ${fromWalletType} to ${toWalletType}`);

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Deduct from source wallet
    const deductResult = await pool.query(
      `UPDATE ${fromWalletType}_wallets 
       SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING balance`,
      [amount, fromWalletId]
    );

    if (deductResult.rows.length === 0) {
      throw new Error('Source wallet not found');
    }

    if (deductResult.rows[0].balance < 0) {
      throw new Error('Insufficient funds');
    }

    // Add to destination wallet
    const addResult = await pool.query(
      `UPDATE ${toWalletType}_wallets 
       SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING balance`,
      [amount, toWalletId]
    );

    if (addResult.rows.length === 0) {
      throw new Error('Destination wallet not found');
    }

    // Record transaction
    await pool.query(
      'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
      [fromWalletType, fromWalletId, 'transfer', -amount, `Transfer to ${toWalletType} wallet: ${description}`, createdBy]
    );

    await pool.query(
      'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
      [toWalletType, toWalletId, 'transfer', amount, `Transfer from ${fromWalletType} wallet: ${description}`, createdBy]
    );

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`✅ Transfer completed successfully`);
    res.json({
      success: true,
      message: 'Transfer completed successfully'
    });

  } catch (error) {
    // Rollback transaction
    await pool.query('ROLLBACK');
    console.error(`❌ Error transferring money:`, error);
    res.status(500).json({
      error: error.message || "Failed to transfer money"
    });
  }
};
