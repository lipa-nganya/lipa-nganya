// src/controllers/mpesaController.js
import axios from "axios";
import moment from "moment";
import dotenv from "dotenv";
import { creditPaymentToMatatuWallet } from "../services/walletService.js";

dotenv.config();

// Generate base64 password for STK Push
const getStkPushPassword = () => {
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
  ).toString("base64");
  return { password, timestamp };
};

// ✅ Initiate STK Push
export const lipaNaMpesaOnline = async (req, res, pool) => {
  const { phoneNumber, amount, customerId, matatuId } = req.body;

  if (!phoneNumber || !amount || !customerId || !matatuId) {
    return res.status(400).json({
      message: "phoneNumber, amount, customerId, and matatuId are required"
    });
  }

  const { password, timestamp } = getStkPushPassword();
  const sanitizedPhone = phoneNumber.replace(/\D/g, "");

  const stkPushRequest = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: sanitizedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: sanitizedPhone,
    CallBackURL: `https://lipa-nganya-api.onrender.com/api/mpesa/stkcallback`,
    AccountReference: `Matatu ${matatuId}`,
    TransactionDesc: "Payment"
  };

  try {
    // Get access token with timeout
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: {
          username: process.env.MPESA_CONSUMER_KEY,
          password: process.env.MPESA_CONSUMER_SECRET
        },
        timeout: 15000 // 15 seconds timeout for token request
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log("✅ M-Pesa access token obtained");

    // Send STK Push with increased timeout
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 seconds timeout for STK Push request
      }
    );

    console.log("✅ STK Push request sent successfully:", response.data);

    // Create or find customer by phone number
    let customerResult = await pool.query(
      "SELECT id FROM customers WHERE phone = $1",
      [sanitizedPhone]
    );

    let actualCustomerId = customerId;
    
    if (customerResult.rows.length === 0) {
      // Create new customer with phone number
      try {
        const newCustomerResult = await pool.query(
          "INSERT INTO customers(phone, name, email) VALUES($1, $2, $3) RETURNING id",
          [sanitizedPhone, `Customer ${sanitizedPhone}`, null]
        );
        actualCustomerId = newCustomerResult.rows[0].id;
        console.log(`✅ Created new customer with ID: ${actualCustomerId}`);
      } catch (insertError) {
        console.error("❌ Error inserting customer:", insertError.message);
        // Try without email column if it doesn't exist
        const newCustomerResult = await pool.query(
          "INSERT INTO customers(phone, name) VALUES($1, $2) RETURNING id",
          [sanitizedPhone, `Customer ${sanitizedPhone}`]
        );
        actualCustomerId = newCustomerResult.rows[0].id;
        console.log(`✅ Created new customer (no email) with ID: ${actualCustomerId}`);
      }
    } else {
      actualCustomerId = customerResult.rows[0].id;
      console.log(`✅ Found existing customer with ID: ${actualCustomerId}`);
    }

    // Insert pending payment
    const paymentResult = await pool.query(
      "INSERT INTO payments(customer_id, matatu_id, amount, phone, status) VALUES($1,$2,$3,$4,'pending') RETURNING id",
      [actualCustomerId, matatuId, amount, sanitizedPhone]
    );
    
    console.log(`✅ Created pending payment with ID: ${paymentResult.rows[0].id}`);

    res.status(200).json({ 
      message: "STK push initiated", 
      response: response.data,
      paymentId: paymentResult.rows[0].id,
      customerId: actualCustomerId
    });
  } catch (error) {
    console.error("❌ STK Push error:", error.response?.data || error.message);
    console.error("❌ Error details:", error);
    
    // Still try to create customer and payment record even if STK Push fails
    try {
      let customerResult = await pool.query(
        "SELECT id FROM customers WHERE phone = $1",
        [sanitizedPhone]
      );

      let actualCustomerId = customerId;
      
      if (customerResult.rows.length === 0) {
        try {
          const newCustomerResult = await pool.query(
            "INSERT INTO customers(phone, name) VALUES($1, $2) RETURNING id",
            [sanitizedPhone, `Customer ${sanitizedPhone}`]
          );
          actualCustomerId = newCustomerResult.rows[0].id;
        } catch (insertError) {
          console.error("❌ Error inserting customer:", insertError.message);
        }
      } else {
        actualCustomerId = customerResult.rows[0].id;
      }

      // Insert failed payment
      await pool.query(
        "INSERT INTO payments(customer_id, matatu_id, amount, phone, status) VALUES($1,$2,$3,$4,'failed')",
        [actualCustomerId, matatuId, amount, sanitizedPhone]
      );
      
      console.log("✅ Created failed payment record");
    } catch (dbError) {
      console.error("❌ Error creating payment record:", dbError.message);
    }
    
    res.status(500).json({
      message: "STK Push failed",
      error: error.response?.data || error.message
    });
  }
};

// ✅ Handle STK Push callback
export const mpesaCallback = async (req, res) => {
  const pool = req.pool;
  const callbackData = req.body;
  
  console.log('📱 Raw callback received:', JSON.stringify(callbackData, null, 2));
  
  const items = callbackData.Body?.stkCallback?.CallbackMetadata?.Item || [];
  const resultCode = callbackData.Body?.stkCallback?.ResultCode;

  const amount = items.find((i) => i.Name === "Amount")?.Value;
  const phone = items.find((i) => i.Name === "PhoneNumber")?.Value;
  const mpesaTransactionId = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

  console.log(`📱 STK Callback received: Phone: ${phone}, Amount: ${amount}, Result: ${resultCode}`);

  try {
    if (resultCode === 0) {
      // Payment successful - update payment status
      const updateResult = await pool.query(
        "UPDATE payments SET status='success', mpesa_transaction_id=$3 WHERE phone=$1 AND amount=$2 AND status='pending' RETURNING *",
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
        } else {
          console.error(`❌ Failed to credit payment to wallet: ${walletResult.error}`);
        }
      } else {
        console.log('⚠️ No pending payment found to update');
      }
    } else {
      // Payment failed - update status
      await pool.query(
        "UPDATE payments SET status='failed' WHERE phone=$1 AND amount=$2 AND status='pending'",
        [phone, amount]
      );
      console.log(`❌ Payment failed for phone: ${phone}, amount: ${amount}`);
    }

    res.status(200).send("Callback received");
  } catch (err) {
    console.error('❌ Error processing STK callback:', err);
    res.status(500).send("Error processing callback");
  }
};
