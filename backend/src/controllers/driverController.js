import axios from 'axios';

// Advanta SMS API configuration
const ADVANTA_API_URL = 'https://quicksms.advantasms.com/api/services/sendsms/';
const ADVANTA_API_KEY = process.env.ADVANTA_API_KEY || 'your_api_key_here';
const ADVANTA_PARTNER_ID = process.env.ADVANTA_PARTNER_ID || 'your_partner_id_here';
const ADVANTA_SHORTCODE = process.env.ADVANTA_SHORTCODE || 'LIPANGANYA';

// ✅ Send OTP for driver authentication
export const sendDriverOTP = async (req, res) => {
  const { matatuNumber, matatuId } = req.body;

  console.log(`🔍 Sending driver OTP for matatu: ${matatuNumber}`);

  if (!matatuNumber || !matatuId) {
    return res.status(400).json({ 
      error: "Matatu number and ID are required" 
    });
  }

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔍 Generated driver OTP: ${otp} for matatu: ${matatuNumber}`);
    
    // Store OTP temporarily (in production, this should be stored securely on backend)
    // For now, we'll use a simple in-memory store
    global.driverOTPs = global.driverOTPs || {};
    global.driverOTPs[matatuNumber] = {
      otp: otp,
      matatuId: matatuId,
      timestamp: Date.now()
    };
    
    // Send OTP via Advanta SMS API
    const message = `Your Lipa Nganya driver verification code is: ${otp}. Valid for 5 minutes.`;
    
    const smsPayload = {
      apikey: ADVANTA_API_KEY,
      partnerID: ADVANTA_PARTNER_ID,
      message: message,
      shortcode: ADVANTA_SHORTCODE,
      mobile: "254708374153" // This should be the driver's phone number from database
    };

    console.log(`📡 Sending driver SMS via Advanta API:`, smsPayload);

    // Send SMS via Advanta API
    const response = await axios.post(ADVANTA_API_URL, smsPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`✅ Advanta SMS API response:`, response.data);

    if (response.data && response.data.responses && response.data.responses.length > 0) {
      const smsResponse = response.data.responses[0];
      
      if (smsResponse['respose-code'] === 200) {
        console.log(`✅ Driver OTP sent successfully for matatu ${matatuNumber}`);
        res.json({ 
          success: true,
          message: "Verification code sent successfully",
          messageId: smsResponse.messageid,
          networkId: smsResponse.networkid
        });
      } else {
        console.error(`❌ SMS API error:`, smsResponse);
        res.status(400).json({
          error: "Failed to send verification code",
          details: smsResponse['response-description'] || 'Unknown error'
        });
      }
    } else {
      console.error(`❌ Invalid SMS API response:`, response.data);
      res.status(500).json({
        error: "Invalid response from SMS service"
      });
    }

  } catch (error) {
    console.error(`❌ Error sending driver OTP via Advanta API:`, error);
    
    if (error.response) {
      console.error(`❌ API Error Response:`, error.response.data);
      res.status(500).json({
        error: "Failed to send verification code",
        details: error.response.data || error.message
      });
    } else if (error.request) {
      console.error(`❌ Network Error:`, error.request);
      res.status(500).json({
        error: "Network error. Please try again."
      });
    } else {
      console.error(`❌ General Error:`, error.message);
      res.status(500).json({
        error: "Failed to send verification code. Please try again."
      });
    }
  }
};

// ✅ Verify driver OTP
export const verifyDriverOTP = async (req, res) => {
  const { matatuNumber, otp } = req.body;

  console.log(`🔍 Verifying driver OTP for matatu: ${matatuNumber}`);

  if (!matatuNumber || !otp) {
    return res.status(400).json({ 
      error: "Matatu number and OTP are required" 
    });
  }

  try {
    // Check if OTP exists and is valid
    global.driverOTPs = global.driverOTPs || {};
    const storedOTP = global.driverOTPs[matatuNumber];
    
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
      delete global.driverOTPs[matatuNumber];
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
    
    // OTP is valid, create or find driver
    const driverData = await createOrFindDriver(matatuNumber, storedOTP.matatuId);
    
    if (!driverData) {
      return res.status(500).json({
        error: "Failed to create driver account"
      });
    }
    
    // Clean up OTP
    delete global.driverOTPs[matatuNumber];
    
    console.log(`✅ Driver OTP verified successfully for matatu ${matatuNumber}`);
    res.json({
      success: true,
      message: "Driver authenticated successfully",
      driver: driverData.driver,
      matatu: driverData.matatu
    });

  } catch (error) {
    console.error(`❌ Error verifying driver OTP:`, error);
    res.status(500).json({
      error: "Failed to verify code. Please try again."
    });
  }
};

// ✅ Create or find driver
const createOrFindDriver = async (matatuNumber, matatuId) => {
  try {
    console.log(`🔍 Creating/finding driver for matatu: ${matatuNumber}`);
    
    // For now, create a mock driver - in production this would query the database
    const driver = {
      id: 1,
      name: `Driver ${matatuNumber}`,
      phone: "254708374153",
      matatu_id: matatuId,
      created_at: new Date().toISOString()
    };
    
    const matatu = {
      id: matatuId,
      number: matatuNumber,
      route_name: "Route 1",
      sacco_name: "Sacco A",
      routes: ["Route 1", "Route 2", "Route 3"]
    };
    
    console.log(`✅ Driver created/found:`, driver);
    return { driver, matatu };
    
  } catch (error) {
    console.error(`❌ Error creating/finding driver:`, error);
    return null;
  }
};
