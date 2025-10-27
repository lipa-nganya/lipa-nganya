import axios from 'axios';
import pool from '../config/db.js';

// Advanta SMS API configuration
const ADVANTA_API_URL = 'https://quicksms.advantasms.com/api/services/sendsms/';
const ADVANTA_API_KEY = process.env.ADVANTA_API_KEY || 'your_api_key_here';
const ADVANTA_PARTNER_ID = process.env.ADVANTA_PARTNER_ID || 'your_partner_id_here';
const ADVANTA_SHORTCODE = process.env.ADVANTA_SHORTCODE || 'LIPANGANYA';

// ✅ Send OTP for driver/conductor authentication
export const sendDriverOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  console.log(`🔍 Sending driver OTP for phone: ${phoneNumber}`);

  if (!phoneNumber) {
    return res.status(400).json({ 
      error: "Phone number is required" 
    });
  }

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔍 Generated driver OTP: ${otp} for phone: ${phoneNumber}`);
    
    // Store OTP temporarily (in production, this should be stored securely on backend)
    // For now, we'll use a simple in-memory store
    global.driverOTPs = global.driverOTPs || {};
    global.driverOTPs[phoneNumber] = {
      otp: otp,
      phoneNumber: phoneNumber,
      timestamp: Date.now()
    };
    
    // BYPASS SMS API FOR NOW - Just return success
    console.log(`✅ Driver OTP generated (SMS bypassed): ${otp} for phone ${phoneNumber}`);
    console.log(`📱 OTP for testing: ${otp}`);
    
    res.json({ 
      success: true,
      message: "OTP generated successfully (SMS bypassed for testing)",
      otp: otp, // Include OTP in response for testing
      messageId: "test-" + Date.now(),
      networkId: "test"
    });

  } catch (error) {
    console.error(`❌ Error in driver OTP generation:`, error);
    res.status(500).json({
      error: "Failed to generate OTP. Please try again."
    });
  }
};

// ✅ Verify driver/conductor OTP
export const verifyDriverOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  console.log(`🔍 Verifying driver OTP for phone: ${phoneNumber}`);

  if (!phoneNumber || !otp) {
    return res.status(400).json({ 
      error: "Phone number and OTP are required" 
    });
  }

  try {
    // Check if OTP exists and is valid
    global.driverOTPs = global.driverOTPs || {};
    const storedOTP = global.driverOTPs[phoneNumber];
    
    if (!storedOTP) {
      return res.status(400).json({
        error: "No verification code found. Please request a new code."
      });
    }
    
    // Check if OTP is expired (5 minutes)
    const now = Date.now();
    const otpAge = now - storedOTP.timestamp;
    const fiveMinutes = 5 * 60 * 1000;
    
    if (otpAge > fiveMinutes) {
      delete global.driverOTPs[phoneNumber];
      return res.status(400).json({
        error: "Verification code has expired. Please request a new code."
      });
    }
    
    // Verify OTP
    if (otp !== storedOTP.otp) {
      return res.status(400).json({
        error: "Invalid verification code. Please try again."
      });
    }
    
    // OTP is valid, create or find driver/conductor
    const driverData = await createOrFindDriver(phoneNumber);
    
    if (!driverData) {
      return res.status(500).json({
        error: "Failed to create driver account"
      });
    }
    
    // Clean up OTP
    delete global.driverOTPs[phoneNumber];
    
    console.log(`✅ Driver OTP verified successfully for phone ${phoneNumber}`);
    res.json({
      success: true,
      message: "Driver authenticated successfully",
      driver: driverData.driver,
      matatu: driverData.matatu,
      needsPinSetup: !driverData.driver.hasPin
    });

  } catch (error) {
    console.error(`❌ Error verifying driver OTP:`, error);
    res.status(500).json({
      error: "Failed to verify code. Please try again."
    });
  }
};

// ✅ Create or find driver/conductor
const createOrFindDriver = async (phoneNumber) => {
  try {
    console.log(`🔍 Creating/finding driver/conductor for phone: ${phoneNumber}`);
    
    // Check if driver/conductor already exists
    const existingDriver = await pool.query(
      'SELECT * FROM drivers WHERE phone = $1',
      [phoneNumber]
    );
    
    if (existingDriver.rows.length > 0) {
      const driver = existingDriver.rows[0];
      
      // Get matatu information
      const matatuResult = await pool.query(
        'SELECT m.*, s.name as sacco_name FROM matatus m JOIN saccos s ON m.sacco_id = s.id WHERE m.id = $1',
        [driver.matatu_id]
      );
      
      const matatu = matatuResult.rows[0] || {
        id: driver.matatu_id,
        route_name: 'Unknown Route',
        sacco_name: 'Unknown Sacco'
      };
      
      console.log(`✅ Found existing driver/conductor:`, driver);
      return { 
        driver: {
          ...driver,
          hasPin: !!driver.pin
        }, 
        matatu 
      };
    }
    
    // Create new driver/conductor (assign to first available matatu)
    const matatuResult = await pool.query('SELECT * FROM matatus LIMIT 1');
    if (matatuResult.rows.length === 0) {
      throw new Error('No matatus available');
    }
    
    const matatu = matatuResult.rows[0];
    
    const newDriver = await pool.query(
      'INSERT INTO drivers (name, phone, role, matatu_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [`Driver ${phoneNumber.slice(-4)}`, phoneNumber, 'driver', matatu.id]
    );
    
    const driver = newDriver.rows[0];
    
    // Get sacco name
    const saccoResult = await pool.query(
      'SELECT name FROM saccos WHERE id = $1',
      [matatu.sacco_id]
    );
    
    const matatuWithSacco = {
      ...matatu,
      sacco_name: saccoResult.rows[0]?.name || 'Unknown Sacco'
    };
    
    console.log(`✅ Created new driver/conductor:`, driver);
    return { 
      driver: {
        ...driver,
        hasPin: false
      }, 
      matatu: matatuWithSacco 
    };
    
  } catch (error) {
    console.error(`❌ Error creating/finding driver:`, error);
    return null;
  }
};

// ✅ Setup PIN for driver/conductor
export const setupPin = async (req, res) => {
  const { phoneNumber, pin } = req.body;

  console.log(`🔍 Setting up PIN for phone: ${phoneNumber}`);

  if (!phoneNumber || !pin) {
    return res.status(400).json({ 
      error: "Phone number and PIN are required" 
    });
  }

  if (pin.length !== 4) {
    return res.status(400).json({ 
      error: "PIN must be 4 digits" 
    });
  }

  try {
    // In production, this would hash the PIN using bcrypt
    // For now, we'll store it as plain text (NOT RECOMMENDED FOR PRODUCTION)
    const hashedPin = pin; // In production: await bcrypt.hash(pin, 10);
    
    // Update the driver/conductor record with the PIN
    const result = await pool.query(
      'UPDATE drivers SET pin = $1 WHERE phone = $2 RETURNING *',
      [hashedPin, phoneNumber]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Driver not found"
      });
    }
    
    console.log(`✅ PIN setup successful for phone: ${phoneNumber}`);
    
    res.json({
      success: true,
      message: "PIN setup successful",
      phoneNumber: phoneNumber
    });

  } catch (error) {
    console.error(`❌ Error setting up PIN:`, error);
    res.status(500).json({
      error: "Failed to setup PIN. Please try again."
    });
  }
};
