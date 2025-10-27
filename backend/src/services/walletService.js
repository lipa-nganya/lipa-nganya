import pool from '../config/db.js';

// LP Wallet Service - Handles automatic payment crediting to matatu wallets

export const creditPaymentToMatatuWallet = async (paymentData) => {
  const { matatuId, amount, phone, mpesaTransactionId } = paymentData;
  
  console.log(`💰 Crediting payment to matatu wallet: Matatu ${matatuId}, Amount: ${amount}`);
  
  try {
    // Start a transaction to ensure data consistency
    await pool.query('BEGIN');
    
    // Get the payment record to verify it exists
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE phone = $1 AND amount = $2 AND matatu_id = $3 AND status = $4 ORDER BY created_at DESC LIMIT 1',
      [phone, amount, matatuId, 'success']
    );
    
    if (paymentResult.rows.length === 0) {
      console.log('❌ No successful payment found to credit');
      await pool.query('ROLLBACK');
      return { success: false, error: 'No successful payment found' };
    }
    
    const payment = paymentResult.rows[0];
    
    // Check if this payment has already been credited
    const existingTransaction = await pool.query(
      'SELECT * FROM wallet_transactions WHERE reference_id = $1 AND transaction_type = $2',
      [mpesaTransactionId || payment.mpesa_transaction_id, 'payment_received']
    );
    
    if (existingTransaction.rows.length > 0) {
      console.log('⚠️ Payment already credited to wallet');
      await pool.query('ROLLBACK');
      return { success: false, error: 'Payment already credited' };
    }
    
    // Get matatu wallet ID
    const matatuWalletResult = await pool.query(
      'SELECT id FROM matatu_wallets WHERE matatu_id = $1',
      [matatuId]
    );
    
    if (matatuWalletResult.rows.length === 0) {
      console.log('❌ Matatu wallet not found');
      await pool.query('ROLLBACK');
      return { success: false, error: 'Matatu wallet not found' };
    }
    
    const matatuWalletId = matatuWalletResult.rows[0].id;
    
    // Credit the amount to matatu wallet
    const updateWalletResult = await pool.query(
      'UPDATE matatu_wallets SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance',
      [amount, matatuWalletId]
    );
    
    if (updateWalletResult.rows.length === 0) {
      console.log('❌ Failed to update matatu wallet balance');
      await pool.query('ROLLBACK');
      return { success: false, error: 'Failed to update wallet balance' };
    }
    
    const newBalance = updateWalletResult.rows[0].balance;
    
    // Create wallet transaction record
    await pool.query(
      'INSERT INTO wallet_transactions (wallet_type, wallet_id, transaction_type, amount, description, reference_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        'matatu',
        matatuWalletId,
        'payment_received',
        amount,
        `Customer payment from ${phone}`,
        mpesaTransactionId || payment.mpesa_transaction_id,
        null // No specific user initiated this - it's automatic
      ]
    );
    
    // Update payment record to mark as wallet credited
    await pool.query(
      'UPDATE payments SET wallet_credited = true WHERE id = $1',
      [payment.id]
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    console.log(`✅ Successfully credited ${amount} to matatu ${matatuId} wallet. New balance: ${newBalance}`);
    
    return {
      success: true,
      matatuWalletId,
      newBalance,
      amount,
      transactionId: mpesaTransactionId || payment.mpesa_transaction_id
    };
    
  } catch (error) {
    console.error('❌ Error crediting payment to matatu wallet:', error);
    await pool.query('ROLLBACK');
    return { success: false, error: error.message };
  }
};

export const getMatatuWalletBalance = async (matatuId) => {
  try {
    const result = await pool.query(
      'SELECT balance FROM matatu_wallets WHERE matatu_id = $1',
      [matatuId]
    );
    
    if (result.rows.length === 0) {
      return { success: false, error: 'Matatu wallet not found' };
    }
    
    return {
      success: true,
      balance: parseFloat(result.rows[0].balance)
    };
  } catch (error) {
    console.error('❌ Error getting matatu wallet balance:', error);
    return { success: false, error: error.message };
  }
};

export const getMatatuWalletTransactions = async (matatuId, limit = 10) => {
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
    
    return {
      success: true,
      transactions: result.rows
    };
  } catch (error) {
    console.error('❌ Error getting matatu wallet transactions:', error);
    return { success: false, error: error.message };
  }
};

export const recalculateWalletBalances = async () => {
  try {
    console.log('🔄 Recalculating all wallet balances from transactions...');
    
    // Recalculate matatu wallet balances
    const matatuWallets = await pool.query('SELECT id, matatu_id FROM matatu_wallets');
    
    for (const wallet of matatuWallets.rows) {
      const transactionsResult = await pool.query(
        `SELECT 
          SUM(CASE WHEN transaction_type = 'payment_received' THEN amount ELSE 0 END) as total_credits,
          SUM(CASE WHEN transaction_type IN ('b2c_send', 'fuel_payment', 'sacco_payment', 'owner_payment', 'withdrawal') THEN amount ELSE 0 END) as total_debits
         FROM wallet_transactions 
         WHERE wallet_type = 'matatu' AND wallet_id = $1`,
        [wallet.id]
      );
      
      const totals = transactionsResult.rows[0];
      const calculatedBalance = (parseFloat(totals.total_credits) || 0) - (parseFloat(totals.total_debits) || 0);
      
      await pool.query(
        'UPDATE matatu_wallets SET balance = $1, updated_at = NOW() WHERE id = $2',
        [calculatedBalance, wallet.id]
      );
      
      console.log(`✅ Recalculated matatu ${wallet.matatu_id} wallet balance: ${calculatedBalance}`);
    }
    
    // Recalculate driver wallet balances
    const driverWallets = await pool.query('SELECT id, driver_id FROM driver_wallets');
    
    for (const wallet of driverWallets.rows) {
      const transactionsResult = await pool.query(
        `SELECT 
          SUM(CASE WHEN transaction_type = 'salary_payment' THEN amount ELSE 0 END) as total_credits,
          SUM(CASE WHEN transaction_type IN ('b2c_send', 'withdrawal') THEN amount ELSE 0 END) as total_debits
         FROM wallet_transactions 
         WHERE wallet_type = 'driver' AND wallet_id = $1`,
        [wallet.id]
      );
      
      const totals = transactionsResult.rows[0];
      const calculatedBalance = (parseFloat(totals.total_credits) || 0) - (parseFloat(totals.total_debits) || 0);
      
      await pool.query(
        'UPDATE driver_wallets SET balance = $1, updated_at = NOW() WHERE id = $2',
        [calculatedBalance, wallet.id]
      );
      
      console.log(`✅ Recalculated driver ${wallet.driver_id} wallet balance: ${calculatedBalance}`);
    }
    
    // Recalculate conductor wallet balances
    const conductorWallets = await pool.query('SELECT id, conductor_id FROM conductor_wallets');
    
    for (const wallet of conductorWallets.rows) {
      const transactionsResult = await pool.query(
        `SELECT 
          SUM(CASE WHEN transaction_type = 'salary_payment' THEN amount ELSE 0 END) as total_credits,
          SUM(CASE WHEN transaction_type IN ('b2c_send', 'withdrawal') THEN amount ELSE 0 END) as total_debits
         FROM wallet_transactions 
         WHERE wallet_type = 'conductor' AND wallet_id = $1`,
        [wallet.id]
      );
      
      const totals = transactionsResult.rows[0];
      const calculatedBalance = (parseFloat(totals.total_credits) || 0) - (parseFloat(totals.total_debits) || 0);
      
      await pool.query(
        'UPDATE conductor_wallets SET balance = $1, updated_at = NOW() WHERE id = $2',
        [calculatedBalance, wallet.id]
      );
      
      console.log(`✅ Recalculated conductor ${wallet.conductor_id} wallet balance: ${calculatedBalance}`);
    }
    
    console.log('✅ All wallet balances recalculated successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error recalculating wallet balances:', error);
    return { success: false, error: error.message };
  }
};

export const createMatatuWalletIfNotExists = async (matatuId) => {
  try {
    // Check if wallet already exists
    const existingWallet = await pool.query(
      'SELECT id FROM matatu_wallets WHERE matatu_id = $1',
      [matatuId]
    );
    
    if (existingWallet.rows.length > 0) {
      return { success: true, walletId: existingWallet.rows[0].id, created: false };
    }
    
    // Create new wallet
    const result = await pool.query(
      'INSERT INTO matatu_wallets (matatu_id, balance) VALUES ($1, $2) RETURNING id',
      [matatuId, 0]
    );
    
    console.log(`✅ Created matatu wallet for matatu ${matatuId}`);
    
    return {
      success: true,
      walletId: result.rows[0].id,
      created: true
    };
  } catch (error) {
    console.error('❌ Error creating matatu wallet:', error);
    return { success: false, error: error.message };
  }
};
