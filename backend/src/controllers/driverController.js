import axios from 'axios';

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
    
    // For now, create a mock driver/conductor - in production this would query the database
    const driver = {
      id: 1,
      name: `Driver ${phoneNumber.slice(-4)}`, // Use last 4 digits of phone
      phone: phoneNumber,
      role: "driver", // or "conductor" - this would come from database
      matatu_id: 1, // This would be looked up from database
      hasPin: false, // This would come from database
      created_at: new Date().toISOString()
    };
    
    const matatu = {
      id: 1,
      number: "KCA123A", // This would come from database
      route_name: "Route 1",
      sacco_name: "Sacco A",
      routes: ["Route 1", "Route 2", "Route 3"]
    };
    
    console.log(`✅ Driver/conductor created/found:`, driver);
    return { driver, matatu };
    
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
    // In production, this would:
    // 1. Hash the PIN using bcrypt
    // 2. Store it in the database
    // 3. Update the driver/conductor record
    
    // For now, just simulate success
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
