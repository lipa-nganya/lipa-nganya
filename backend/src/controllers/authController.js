import axios from 'axios';

// Advanta SMS API configuration
const ADVANTA_API_URL = 'https://quicksms.advantasms.com/api/services/sendsms/';
const ADVANTA_API_KEY = process.env.ADVANTA_API_KEY || 'your_api_key_here';
const ADVANTA_PARTNER_ID = process.env.ADVANTA_PARTNER_ID || 'your_partner_id_here';
const ADVANTA_SHORTCODE = process.env.ADVANTA_SHORTCODE || 'LIPANGANYA';

// ✅ Send OTP via Advanta SMS API
export const sendOTP = async (req, res) => {
  const { phone, message, otp } = req.body;

  console.log(`🔍 Sending OTP via Advanta SMS API`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`📝 Message: ${message}`);
  console.log(`🔢 OTP: ${otp}`);

  if (!phone || !message || !otp) {
    return res.status(400).json({ 
      error: "Phone number, message, and OTP are required" 
    });
  }

  try {
    // Prepare SMS payload for Advanta API
    const smsPayload = {
      apikey: ADVANTA_API_KEY,
      partnerID: ADVANTA_PARTNER_ID,
      message: message,
      shortcode: ADVANTA_SHORTCODE,
      mobile: phone
    };

    console.log(`📡 Sending SMS via Advanta API:`, smsPayload);

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
        console.log(`✅ OTP sent successfully to ${phone}`);
        res.json({ 
          success: true,
          message: "OTP sent successfully",
          messageId: smsResponse.messageid,
          networkId: smsResponse.networkid
        });
      } else {
        console.error(`❌ SMS API error:`, smsResponse);
        res.status(400).json({
          error: "Failed to send OTP",
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
    console.error(`❌ Error sending OTP via Advanta API:`, error);
    
    if (error.response) {
      console.error(`❌ API Error Response:`, error.response.data);
      res.status(500).json({
        error: "Failed to send OTP",
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
        error: "Failed to send OTP. Please try again."
      });
    }
  }
};

// ✅ Verify OTP (for future use if needed)
export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  console.log(`🔍 Verifying OTP for phone: ${phone}`);

  if (!phone || !otp) {
    return res.status(400).json({ 
      error: "Phone number and OTP are required" 
    });
  }

  // In a real implementation, you would:
  // 1. Retrieve the stored OTP from database/cache
  // 2. Compare with the provided OTP
  // 3. Check expiration time
  // 4. Return verification result

  // For now, we'll do basic validation
  if (otp.length === 6 && /^\d{6}$/.test(otp)) {
    res.json({ 
      success: true,
      message: "OTP verified successfully"
    });
  } else {
    res.status(400).json({
      error: "Invalid OTP format"
    });
  }
};
