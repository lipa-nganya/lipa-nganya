// src/controllers/mpesaController.js
import axios from "axios";
import moment from "moment";
import dotenv from "dotenv";

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
    // Get access token
    const tokenResponse = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        auth: {
          username: process.env.MPESA_CONSUMER_KEY,
          password: process.env.MPESA_CONSUMER_SECRET
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Send STK Push
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Insert pending payment
    await pool.query(
      "INSERT INTO payments(customer_id, matatu_id, amount, phone, status) VALUES($1,$2,$3,$4,'pending')",
      [customerId, matatuId, amount, sanitizedPhone]
    );

    res.status(200).json({ message: "STK push initiated", response: response.data });
  } catch (error) {
    console.error("❌ STK Push error:", error.response?.data || error.message);
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
  const items = callbackData.Body?.stkCallback?.CallbackMetadata?.Item || [];
  const resultCode = callbackData.Body?.stkCallback?.ResultCode;

  const amount = items.find((i) => i.Name === "Amount")?.Value;
  const phone = items.find((i) => i.Name === "PhoneNumber")?.Value;

  try {
    if (resultCode === 0) {
      await pool.query(
        "UPDATE payments SET status='success', payment_time=NOW() WHERE phone=$1 AND amount=$2 AND status='pending'",
        [phone, amount]
      );
    } else {
      await pool.query(
        "UPDATE payments SET status='failed' WHERE phone=$1 AND amount=$2 AND status='pending'",
        [phone, amount]
      );
    }

    res.status(200).send("Callback received");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing callback");
  }
};
