import { useState, useEffect } from "react";

// ✅ Automatically choose backend URL based on environment
const LOCAL_URL = "http://localhost:7070";
const SERVER_URL = "https://lipa-nganya-api.onrender.com";
const BACKEND_URL = window.location.hostname === "localhost" ? LOCAL_URL : SERVER_URL;

// Icons as SVG components
const PayIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const RateIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const SupportIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const BackIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function App() {
  const [step, setStep] = useState("home"); // home, matatuCheck, payment, waiting, confirmation, rate, history, login, profile
  const [matatuNumber, setMatatuNumber] = useState("");
  const [matatuDetails, setMatatuDetails] = useState(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  
  // Name capture state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  
  // Payment details state
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Authentication state - OTP-based
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  
  // Hamburger menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    // Check if there's a customer in localStorage (phone-based auth)
    const savedCustomer = localStorage.getItem('lipaNganyaCustomer');
    if (savedCustomer) {
      try {
        const customerData = JSON.parse(savedCustomer);
        setCustomer(customerData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved customer:', error);
        localStorage.removeItem('lipaNganyaCustomer');
      }
    }
  }, []);

  // Load payment history when customer is available
  useEffect(() => {
    if (customer && isAuthenticated) {
      loadPaymentHistory();
    }
  }, [customer, isAuthenticated]);

  const handlePayFareClick = () => {
    setStep("matatuCheck");
    setMatatuNumber("");
    setMatatuDetails(null);
    setError("");
  };

  const handleRateMatatuClick = () => {
    setStep("rate");
    setMatatuNumber("");
    setRating("");
    setComment("");
    setError("");
  };

  const handleLoginClick = () => {
    setStep("login");
    setError("");
  };

  const handleHistoryClick = async () => {
    if (!customer) {
      setError("Please log in to view payment history");
      return;
    }
    setStep("history");
    await loadPaymentHistory();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (menuStep) => {
    setStep(menuStep);
    setIsMenuOpen(false);
    
    // Load payment history when navigating to payments page
    if (menuStep === "history" && customer) {
      loadPaymentHistory();
    }
  };

  // Save customer to localStorage and set authentication
  const saveCustomerAndAuthenticate = (customerData) => {
    setCustomer(customerData);
    setIsAuthenticated(true);
    localStorage.setItem('lipaNganyaCustomer', JSON.stringify(customerData));
  };

  // Handle name capture after successful payment
  const handleNameCapture = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both first and last name");
      return;
    }

    console.log(`🔍 Name capture: firstName='${firstName}', lastName='${lastName}', phone='${phone}'`);
    setLoading(true);
    setError("");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      console.log(`📝 Creating account with full name: '${fullName}'`);
      
      const customerData = await findCustomerByPhone(phone, fullName);
      console.log(`📊 Customer data received:`, customerData);
      
      if (customerData) {
        console.log(`✅ Account created successfully, redirecting to profile`);
        setStep("profile");
      } else {
        console.error(`❌ Failed to create account - no customer data returned`);
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error creating account:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Find or create customer by phone
  const findCustomerByPhone = async (phoneNumber, name = null) => {
    console.log(`🔍 findCustomerByPhone called with phone: ${phoneNumber}, name: ${name}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/create-or-find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          name: name || null
        }),
      });

      console.log(`📡 API response status: ${response.status}`);
      const data = await response.json();
      console.log(`📊 API response data:`, data);

      if (response.ok) {
        const customerData = data.customer;
        console.log(`✅ Customer data from API:`, customerData);
        saveCustomerAndAuthenticate(customerData);
        return customerData;
      } else {
        console.error(`❌ API error:`, data);
        return null;
      }
    } catch (err) {
      console.error("❌ Error finding customer:", err);
      return null;
    }
  };

  // Load payment history
  const loadPaymentHistory = async () => {
    if (!customer) {
      console.log("❌ No customer found, cannot load payment history");
      return [];
    }

    console.log(`🔍 Loading payment history for customer ID: ${customer.id}`);
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/${customer.id}/payments`);
      console.log(`📡 Payment history response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`📊 Payment history data:`, data);

      if (response.ok) {
        setPaymentHistory(data);
        console.log(`✅ Loaded ${data.length} payment records`);
        return data; // Return the data for immediate use
      } else {
        console.error(`❌ Payment history API error:`, data);
        setError("Failed to load payment history");
        return [];
      }
    } catch (err) {
      console.error("❌ Error loading payment history:", err);
      setError("Failed to load payment history");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check matatu details before payment or rating
  const handleCheckMatatu = async () => {
    if (!matatuNumber) {
      setError("Please enter a matatu number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/matatus/${matatuNumber}`);
      if (!response.ok) {
        if (response.status === 404) setError("Matatu not found. Please check the number.");
        else setError("Error fetching matatu info.");
        return;
      }
      const data = await response.json();
      setMatatuDetails(data);
      setStep("payment");
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initiate STK Push
  const handlePayment = async () => {
    if (!phone || !amount || !matatuDetails?.matatu_number) {
      setError("Phone, amount, and matatu details are required");
      return;
    }

    const sanitizedPhone = phone.replace(/\D/g, "");
    if (sanitizedPhone.length < 12) {
      setError("Enter a valid phone number with country code (e.g., 2547XXXXXXXX)");
      return;
    }

    const payload = {
      phoneNumber: sanitizedPhone,
      amount: Number(amount),
      matatuId: matatuDetails.matatu_number,
      customerId: 1, // Replace with actual logged-in customer later
    };

    console.log("STK Push payload:", payload);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/mpesa/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // STK Push initiated successfully - show waiting screen
        setStep("waiting");
        
        // Try to find customer by phone after payment
        let actualCustomer = customer;
        if (!actualCustomer) {
          actualCustomer = await findCustomerByPhone(sanitizedPhone);
        }
        
        // Check if customer already exists and has a name, then redirect accordingly
        setTimeout(() => {
          console.log("🔄 Checking customer status after STK Push initiation");
          
          if (actualCustomer) {
            console.log(`📊 Customer found: ${JSON.stringify(actualCustomer)}`);
            
            // Check if customer already has a name (existing customer)
            if (actualCustomer.name && actualCustomer.name.trim() !== '') {
              console.log("✅ Existing customer with name found, redirecting to payments");
              // Save customer data and authenticate
              saveCustomerAndAuthenticate(actualCustomer);
              setStep("history");
            } else {
              console.log("🆕 New customer or customer without name, redirecting to name capture");
              if (!isAuthenticated) {
                setStep("nameCapture");
              } else {
                setStep("profile");
              }
            }
          } else {
            console.log("❌ No customer found, redirecting to name capture");
            if (!isAuthenticated) {
              setStep("nameCapture");
            } else {
              setStep("profile");
            }
          }
        }, 5000); // Wait 5 seconds for STK Push to be processed
        
        // Keep the original timeout as backup
        setTimeout(async () => {
          try {
            // Backup check: Verify payment was successful and redirect accordingly
            if (actualCustomer) {
              console.log("🔍 Backup check: Verifying payment and customer status...");
              const paymentData = await loadPaymentHistory();
              
              console.log(`📊 Backup check: Payment history length: ${paymentData.length}`);
              if (paymentData.length > 0) {
                console.log("✅ Backup check: Payment successful");
                
                // Check if customer already has a name (existing customer)
                if (actualCustomer.name && actualCustomer.name.trim() !== '') {
                  console.log("✅ Backup check: Existing customer with name, redirecting to payments");
                  saveCustomerAndAuthenticate(actualCustomer);
                  setStep("history");
                } else {
                  console.log("🆕 Backup check: New customer, redirecting to name capture");
                  if (!isAuthenticated) {
                    setStep("nameCapture");
                  } else {
                    setStep("profile");
                  }
                }
              } else {
                console.log("❌ Backup check: No payment history found");
                setError("Payment may not have been completed. Please check your phone and try again.");
                setStep("payment");
              }
            } else {
              console.log("❌ Backup check: No customer found");
              setError("Please check your phone for the M-Pesa prompt. If you don't see it, the payment may have timed out. Please try again.");
              setStep("payment");
            }
          } catch (err) {
            console.error("❌ Backup check error:", err);
            setError("Payment status could not be verified. Please check your payment history.");
            setStep("payment");
          }
        }, 30000); // Wait 30 seconds before showing timeout message
        
      } else {
        console.error("STK Push failed:", data);
        
        // Provide user-friendly error messages based on M-Pesa error codes
        let errorMessage = "Failed to initiate payment";
        
        if (data.error && data.error.errorCode) {
          const errorCode = data.error.errorCode;
          const errorMsg = data.error.errorMessage || "";
          
          switch (errorCode) {
            case "500.003.02":
              errorMessage = "M-Pesa system is busy. Please try again in a few minutes.";
              break;
            case "500.001.1001":
              errorMessage = "Invalid phone number format. Please use format: 2547XXXXXXXX";
              break;
            case "500.001.1002":
              errorMessage = "Amount must be between KES 1 and KES 70,000";
              break;
            case "500.001.1003":
              errorMessage = "Insufficient balance. Please check your M-Pesa account.";
              break;
            case "500.001.1004":
              errorMessage = "Transaction cancelled by user.";
              break;
            case "500.001.1005":
              errorMessage = "Transaction timed out. Please try again.";
              break;
            default:
              errorMessage = errorMsg || data.message || "Payment failed. Please try again.";
          }
        } else {
          errorMessage = data.message || "Failed to initiate payment";
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Failed to connect to server:", err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ OTP Functions using Advanta SMS API
  const sendOTP = async (phoneNumber) => {
    setLoading(true);
    setError("");
    
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`🔍 Generated OTP: ${otp} for phone: ${phoneNumber}`);
      
      // Store OTP temporarily (in production, this should be stored securely on backend)
      sessionStorage.setItem('otpCode', otp);
      sessionStorage.setItem('otpPhone', phoneNumber);
      
      // Send OTP via Advanta SMS API
      const message = `Your Lipa Nganya verification code is: ${otp}. Valid for 5 minutes.`;
      
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message,
          otp: otp
        }),
      });

      const data = await response.json();
      console.log(`📡 OTP send response:`, data);

      if (response.ok) {
        setOtpSent(true);
        setLoginPhone(phoneNumber);
        console.log(`✅ OTP sent successfully to ${phoneNumber}`);
      } else {
        console.error(`❌ OTP send failed:`, data);
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      setError("Failed to send OTP. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const storedOtp = sessionStorage.getItem('otpCode');
      const storedPhone = sessionStorage.getItem('otpPhone');
      
      console.log(`🔍 Verifying OTP: ${otpCode} against stored: ${storedOtp}`);
      
      if (otpCode === storedOtp && loginPhone === storedPhone) {
        // OTP is valid, now find or create customer
        const customerData = await findOrCreateCustomer(loginPhone);
        
        if (customerData) {
          setOtpVerified(true);
          saveCustomerAndAuthenticate(customerData);
          setStep("home");
          
          // Clear OTP data
          sessionStorage.removeItem('otpCode');
          sessionStorage.removeItem('otpPhone');
          setOtpSent(false);
          setOtpCode("");
          setLoginPhone("");
          
          console.log(`✅ OTP verified successfully for ${loginPhone}`);
        } else {
          setError("Failed to create account. Please try again.");
        }
      } else {
        setError("Invalid OTP. Please check and try again.");
        console.log(`❌ OTP verification failed`);
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const findOrCreateCustomer = async (phoneNumber) => {
    try {
      console.log(`🔍 Finding or creating customer for phone: ${phoneNumber}`);
      
      const response = await fetch(`${BACKEND_URL}/api/customers/create-or-find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          name: `Customer ${phoneNumber}` // Default name, can be updated later
        }),
      });

      const data = await response.json();
      console.log(`📊 Customer response:`, data);

      if (response.ok) {
        return data.customer;
      } else {
        console.error(`❌ Customer creation failed:`, data);
        return null;
      }
    } catch (err) {
      console.error("❌ Error finding/creating customer:", err);
      return null;
    }
  };

  // ✅ Handle payment selection
  const handlePaymentClick = (payment) => {
    console.log(`🔍 Payment clicked:`, payment);
    setSelectedPayment(payment);
  };

  const handleClosePaymentDetails = () => {
    setSelectedPayment(null);
  };

  // ✅ Sort payments by most recent first
  const getSortedPayments = () => {
    return [...paymentHistory].sort((a, b) => {
      // If both have created_at, sort by date (newest first)
      if (a.created_at && b.created_at) {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      // If only one has created_at, prioritize it
      if (a.created_at && !b.created_at) return -1;
      if (!a.created_at && b.created_at) return 1;
      // If neither has created_at, sort by ID (higher ID = newer)
      return b.id - a.id;
    });
  };

  // ✅ Handle logout
  const handleLogout = () => {
    setCustomer(null);
    setIsAuthenticated(false);
    setPaymentHistory([]);
    setOtpSent(false);
    setOtpCode("");
    setOtpVerified(false);
    setLoginPhone("");
    localStorage.removeItem('lipaNganyaCustomer');
    sessionStorage.removeItem('otpCode');
    sessionStorage.removeItem('otpPhone');
    setStep("login");
    console.log("✅ User logged out successfully");
  };

  // ✅ Handle profile editing
  const handleEditProfile = () => {
    if (customer && customer.name) {
      // Split the existing name into first and last name
      const nameParts = customer.name.split(' ');
      setEditFirstName(nameParts[0] || '');
      setEditLastName(nameParts.slice(1).join(' ') || '');
    } else {
      setEditFirstName('');
      setEditLastName('');
    }
    setIsEditingProfile(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditFirstName('');
    setEditLastName('');
    setError('');
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      setError('Please enter both first and last name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullName = `${editFirstName.trim()} ${editLastName.trim()}`;
      console.log(`🔍 Updating customer profile: ${customer.id} with name: ${fullName}`);

      const response = await fetch(`${BACKEND_URL}/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          phone: customer.phone
        }),
      });

      const data = await response.json();
      console.log(`📊 Profile update response:`, data);

      if (response.ok) {
        // Update local customer data
        const updatedCustomer = { ...customer, name: fullName };
        setCustomer(updatedCustomer);
        saveCustomerAndAuthenticate(updatedCustomer);
        
        setIsEditingProfile(false);
        setEditFirstName('');
        setEditLastName('');
        
        console.log('✅ Profile updated successfully');
      } else {
        console.error(`❌ Profile update failed:`, data);
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit Rating
  const handleSubmitRating = async () => {
    if (!matatuNumber || !rating) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customer_id: 1, // Replace later with actual logged-in customer
        matatu_number: matatuNumber,
        rating: Number(rating),
        comment,
      };

      console.log("Rating payload:", payload);

      const response = await fetch(`${BACKEND_URL}/api/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Rating submitted successfully!");
        setStep("home");
      } else {
        setError(data.error || "Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Renders...
  // ✅ Render helpers
  const renderHome = () => (
    <div>
      {/* Header with Hamburger Menu and Welcome Message */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--white)",
        padding: "var(--spacing-md)",
        boxShadow: "var(--shadow-sm)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <button
          onClick={toggleMenu}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--spacing-xs)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
        
        {/* Welcome Message */}
        {isAuthenticated && customer && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right"
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: "1rem", 
              fontWeight: "600",
              color: "var(--text-primary)"
            }}>
              Welcome, {customer.name ? customer.name.split(' ')[0] : "Customer"}!
            </p>
            <p style={{ 
              margin: "var(--spacing-xs) 0 0 0", 
              fontSize: "0.85rem", 
              color: "var(--gray-medium)" 
            }}>
              {customer.phone}
            </p>
          </div>
        )}
      </div>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          display: "flex",
          justifyContent: "flex-start"
        }}>
          <div style={{
            backgroundColor: "var(--white)",
            width: "80%",
            maxWidth: "400px",
            padding: "var(--spacing-lg)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)"
          }}>
            <div
              onClick={() => handleMenuClick("home")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Home
            </div>

            <div
              onClick={() => handleMenuClick("matatuCheck")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Lipa Nganya
            </div>

            <div
              onClick={() => handleMenuClick("rate")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Rate Matatu
            </div>

            {isAuthenticated ? (
              <>
                <div
                  onClick={() => handleMenuClick("history")}
                  style={{
                    padding: "var(--spacing-sm)",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "500"
                  }}
                >
                  Payments
                </div>

                <div
                  onClick={() => handleMenuClick("profile")}
                  style={{
                    padding: "var(--spacing-sm)",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "500"
                  }}
                >
                  My Profile
                </div>

                <div
                  onClick={handleLogout}
                  style={{
                    padding: "var(--spacing-sm)",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    color: "var(--accent-salmon)"
                  }}
                >
                  Logout
                </div>
              </>
            ) : (
              <div
                onClick={() => handleMenuClick("login")}
                style={{
                  padding: "var(--spacing-sm)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  color: "var(--accent-orange)"
                }}
              >
                Login
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ marginTop: "80px", padding: "var(--spacing-md)" }}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "var(--spacing-sm)" }}>
            <span style={{ color: "var(--text-primary)" }}>Lipa</span>{" "}
            <span style={{ color: "var(--accent-salmon)" }}>Nganya</span>
          </h1>
          <p style={{ color: "var(--gray-medium)", fontSize: "1rem" }}>
            Cashless Matatu Payments & Ratings
          </p>
        </div>

        {/* 1x2 Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-lg)",
          maxWidth: "400px",
          margin: "0 auto var(--spacing-lg)"
        }}>
          <button
            onClick={handlePayFareClick}
            className="btn btn-primary"
            style={{ 
              aspectRatio: "1", 
              minHeight: "150px", 
              flexDirection: "column",
              fontSize: "1rem",
              padding: "var(--spacing-sm)"
            }}
          >
            <PayIcon />
            <span style={{ marginTop: "var(--spacing-xs)", fontSize: "0.9rem" }}>Lipa Nganya</span>
          </button>
          
          <button
            onClick={handleRateMatatuClick}
            className="btn btn-secondary"
            style={{ 
              aspectRatio: "1", 
              minHeight: "150px", 
              flexDirection: "column",
              fontSize: "1rem",
              padding: "var(--spacing-sm)"
            }}
          >
            <RateIcon />
            <span style={{ marginTop: "var(--spacing-xs)", fontSize: "0.9rem" }}>Rate Matatu</span>
          </button>
        </div>

      </div>
    </div>
  );

  const renderMatatuCheck = () => (
    <div className="card">
      <div className="text-center mb-3">
        <button 
          className="btn btn-outline" 
          onClick={() => setStep("home")} 
          disabled={loading}
          style={{ width: "auto", minHeight: "40px", padding: "var(--spacing-xs) var(--spacing-sm)" }}
        >
          <BackIcon />
          Back
        </button>
      </div>
      
      <h2 className="text-center mb-4">Enter Matatu Number</h2>
      
      <div className="form-group">
        <label className="form-label">Matatu Number</label>
        <input
          type="text"
          className="form-input"
          value={matatuNumber}
          onChange={(e) => setMatatuNumber(e.target.value)}
          placeholder="Enter matatu number"
          disabled={loading}
        />
      </div>
      
      {error && (
        <div style={{ 
          color: "var(--accent-salmon)", 
          backgroundColor: "#ffe6e6", 
          padding: "var(--spacing-sm)", 
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-md)"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <button 
          className="btn btn-primary" 
          onClick={handleCheckMatatu} 
          disabled={loading}
        >
          {loading ? "Checking..." : "Confirm Matatu"}
        </button>
      </div>
    </div>
  );

  const renderWaiting = () => (
    <div className="card">
      <div className="text-center">
        <div style={{ 
          width: "80px", 
          height: "80px", 
          backgroundColor: "var(--accent-orange)", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto var(--spacing-md)",
          color: "white",
          animation: "pulse 2s infinite"
        }}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        
        <h2 style={{ color: "var(--accent-orange)", marginBottom: "var(--spacing-md)" }}>
          Processing Payment...
        </h2>
        
        <div className="card" style={{ backgroundColor: "var(--gray-light)", marginBottom: "var(--spacing-md)" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-sm)" }}>
            <strong>Amount:</strong> {amount} KES
          </p>
          <p style={{ color: "var(--gray-medium)", marginBottom: "var(--spacing-sm)" }}>
            <strong>Matatu:</strong> {matatuDetails?.matatu_number}
          </p>
          <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
            <strong>Phone:</strong> {phone}
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: "#e8f4fd", 
          padding: "var(--spacing-md)", 
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-md)",
          fontSize: "0.9rem"
        }}>
          <p style={{ margin: 0, fontWeight: "600", color: "var(--accent-orange)" }}>
            📱 Check your phone for the M-Pesa prompt
          </p>
          <p style={{ margin: "var(--spacing-xs) 0 0 0", color: "var(--gray-medium)" }}>
            Enter your M-Pesa PIN when prompted to complete the payment
          </p>
        </div>
        
        <button 
          className="btn btn-outline" 
          onClick={() => setStep("payment")}
          style={{ color: "var(--accent-salmon)", borderColor: "var(--accent-salmon)" }}
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="card">
      <div className="text-center mb-3">
        <button 
          className="btn btn-outline" 
          onClick={() => setStep("home")} 
          disabled={loading}
          style={{ width: "auto", minHeight: "40px", padding: "var(--spacing-xs) var(--spacing-sm)" }}
        >
          <BackIcon />
          Back
        </button>
      </div>
      
      <h2 className="text-center mb-4">Confirm Payment</h2>
      
      <div className="card" style={{ backgroundColor: "var(--gray-light)", marginBottom: "var(--spacing-md)" }}>
        <h3 style={{ color: "var(--accent-orange)", marginBottom: "var(--spacing-sm)" }}>
          Matatu Details
        </h3>
        <p><strong>Number:</strong> {matatuDetails.matatu_number}</p>
        <p><strong>Route:</strong> {matatuDetails.route_name}</p>
        <p><strong>Sacco:</strong> {matatuDetails.sacco_name}</p>
      </div>
      
      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <input
          type="tel"
          className="form-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="2547XXXXXXXX"
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Amount (KES)</label>
        <input
          type="number"
          className="form-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          disabled={loading}
        />
      </div>
      
      <div style={{ 
        backgroundColor: "#e8f4fd", 
        padding: "var(--spacing-sm)", 
        borderRadius: "var(--radius-sm)",
        marginBottom: "var(--spacing-md)",
        fontSize: "0.9rem"
      }}>
        💡 You will receive a prompt to enter your M-PESA PIN
      </div>
      
      {error && (
        <div style={{ 
          color: "var(--accent-salmon)", 
          backgroundColor: "#ffe6e6", 
          padding: "var(--spacing-sm)", 
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xs)"
        }}>
          <div>{error}</div>
          {error.includes("system is busy") && (
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setError("");
                handlePayment();
              }}
              style={{
                fontSize: "0.9rem",
                padding: "var(--spacing-xs)",
                alignSelf: "flex-start"
              }}
            >
              🔄 Retry Payment
            </button>
          )}
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <button 
          className="btn btn-primary" 
          onClick={handlePayment} 
          disabled={loading}
        >
          {loading ? "Processing payment..." : "Pay Now"}
        </button>
      </div>
    </div>
  );

  const renderRateMatatu = () => (
    <div className="card">
      <div className="text-center mb-3">
        <button 
          className="btn btn-outline" 
          onClick={() => setStep("home")} 
          disabled={loading}
          style={{ width: "auto", minHeight: "40px", padding: "var(--spacing-xs) var(--spacing-sm)" }}
        >
          <BackIcon />
          Back
        </button>
      </div>
      
      <h2 className="text-center mb-4">Rate a Matatu</h2>
      
      <div className="form-group">
        <label className="form-label">Matatu Number</label>
        <input
          type="text"
          className="form-input"
          value={matatuNumber}
          onChange={(e) => setMatatuNumber(e.target.value)}
          placeholder="Enter matatu number"
          disabled={loading}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Your Rating</label>
        <select
          className="form-input"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          disabled={loading}
        >
          <option value="">Select rating</option>
          <option value="1">⭐ Poor (1)</option>
          <option value="2">⭐⭐ Fair (2)</option>
          <option value="3">⭐⭐⭐ Good (3)</option>
          <option value="4">⭐⭐⭐⭐ Very Good (4)</option>
          <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Comment (Optional)</label>
        <textarea
          className="form-input"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          disabled={loading}
          rows="3"
          style={{ resize: "vertical", minHeight: "80px" }}
        />
      </div>
      
      {error && (
        <div style={{ 
          color: "var(--accent-salmon)", 
          backgroundColor: "#ffe6e6", 
          padding: "var(--spacing-sm)", 
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-md)"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmitRating} 
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="card">
      <div className="text-center">
        <div style={{ 
          width: "80px", 
          height: "80px", 
          backgroundColor: "var(--accent-orange)", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto var(--spacing-md)",
          color: "white"
        }}>
          <CheckIcon />
        </div>
        
        <h2 style={{ color: "var(--accent-orange)", marginBottom: "var(--spacing-md)" }}>
          Payment Successful!
        </h2>
        
        <div className="card" style={{ backgroundColor: "var(--gray-light)", marginBottom: "var(--spacing-md)" }}>
          <p style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-xs)" }}>
            <strong>{confirmation.amount} KES</strong>
          </p>
          <p style={{ color: "var(--gray-medium)", marginBottom: "var(--spacing-xs)" }}>
            Paid to Matatu {confirmation.matatuNumber}
          </p>
          <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
            {confirmation.dateTime}
          </p>
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={() => setStep("home")}
        >
          Done
        </button>
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="card">
      <div className="text-center mb-4">
        <h2>Welcome to Lipa Nganya</h2>
        <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
          Enter your phone number to receive a verification code
        </p>
      </div>
      
      {!otpSent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              placeholder="2547XXXXXXXX"
              disabled={loading}
              style={{ fontSize: "1.1rem", padding: "var(--spacing-md)", minHeight: "56px" }}
            />
          </div>
          
          <div style={{ 
            backgroundColor: "#e8f4fd", 
            padding: "var(--spacing-sm)", 
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--spacing-md)",
            fontSize: "0.9rem"
          }}>
            💡 We'll send you a 6-digit verification code via SMS
          </div>
          
          {error && (
            <div style={{ 
              color: "var(--accent-salmon)", 
              backgroundColor: "#ffe6e6", 
              padding: "var(--spacing-sm)", 
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              border: "1px solid #ffcccc",
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)"
            }}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: "20px", height: "20px" }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {error}
            </div>
          )}
          
          <button 
            className="btn btn-primary" 
            onClick={() => sendOTP(loginPhone)}
            disabled={loading || !loginPhone.trim() || loginPhone.length < 10}
            style={{ fontSize: "1.1rem", fontWeight: "600", minHeight: "60px" }}
          >
            {loading ? (
              <>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Sending Code...
              </>
            ) : (
              <>
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Send Verification Code
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              className="form-input"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              disabled={loading}
              style={{ fontSize: "1.5rem", padding: "var(--spacing-md)", minHeight: "56px", textAlign: "center", letterSpacing: "0.5rem" }}
            />
          </div>
          
          <div style={{ 
            backgroundColor: "#e8f5e8", 
            padding: "var(--spacing-sm)", 
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--spacing-md)",
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            ✅ Verification code sent to {loginPhone}
          </div>
          
          {error && (
            <div style={{ 
              color: "var(--accent-salmon)", 
              backgroundColor: "#ffe6e6", 
              padding: "var(--spacing-sm)", 
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              border: "1px solid #ffcccc",
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)"
            }}>
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: "20px", height: "20px" }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {error}
            </div>
          )}
          
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <button 
              className="btn btn-primary" 
              onClick={verifyOTP}
              disabled={loading || otpCode.length !== 6}
              style={{ flex: 1, fontSize: "1.1rem", fontWeight: "600", minHeight: "60px" }}
            >
              {loading ? (
                <>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  Verify Code
                </>
              )}
            </button>
            
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
                setError("");
              }}
              disabled={loading}
              style={{ flex: 1, fontSize: "1rem", minHeight: "60px" }}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentHistory = () => (
    <div className="card">
      <div className="text-center mb-3">
        <button 
          className="btn btn-outline" 
          onClick={() => setStep("home")} 
          disabled={loading}
          style={{ width: "auto", minHeight: "40px", padding: "var(--spacing-xs) var(--spacing-sm)" }}
        >
          <BackIcon />
          Back
        </button>
      </div>
      
      <h2 className="text-center mb-4">Payment History</h2>
      
      {loading ? (
        <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
          <p>Loading payment history...</p>
        </div>
      ) : paymentHistory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
          <p style={{ color: "var(--gray-medium)" }}>No payment history found</p>
          <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
            Make your first payment to see it here!
          </p>
        </div>
      ) : (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "var(--spacing-xs)",
          maxHeight: "70vh",
          overflowY: "auto"
        }}>
          {getSortedPayments().map((payment) => (
            <div 
              key={`customer-payment-${payment.id}`} 
              className="card" 
              onClick={() => handlePaymentClick(payment)}
              style={{ 
                backgroundColor: payment.status === 'success' ? "#e8f5e8" : "#ffe6e6",
                padding: "var(--spacing-sm)",
                minHeight: "60px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "2px solid transparent"
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = payment.status === 'success' ? "var(--accent-orange)" : "var(--accent-salmon)";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "transparent";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flex: 1 }}>
                <div style={{ 
                  padding: "4px 8px", 
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: payment.status === 'success' ? "var(--accent-orange)" : "var(--accent-salmon)",
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  minWidth: "30px",
                  textAlign: "center"
                }}>
                  {payment.status === 'success' ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "1.1rem" }}>
                    {payment.amount} KES
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--gray-medium)" }}>
                    {payment.route_name} - {payment.sacco_name}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                  {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'Recent'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Payment Details Modal */}
      {selectedPayment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 2000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "var(--spacing-md)"
        }}>
          <div className="card" style={{
            backgroundColor: "var(--white)",
            maxWidth: "400px",
            width: "100%",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
              <h3 style={{ margin: 0, color: "var(--accent-orange)" }}>Payment Details</h3>
              <button 
                onClick={handleClosePaymentDetails}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "var(--spacing-xs)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <CloseIcon />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
              <div style={{ 
                padding: "var(--spacing-md)", 
                backgroundColor: selectedPayment.status === 'success' ? "#e8f5e8" : "#ffe6e6",
                borderRadius: "var(--radius-sm)",
                textAlign: "center"
              }}>
                <div style={{ 
                  display: "inline-block",
                  padding: "8px 16px", 
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: selectedPayment.status === 'success' ? "var(--accent-orange)" : "var(--accent-salmon)",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "var(--spacing-sm)"
                }}>
                  {selectedPayment.status === 'success' ? '✓ Payment Successful' : '✗ Payment Failed'}
                </div>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {selectedPayment.amount} KES
                </p>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm)", backgroundColor: "var(--gray-light)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontWeight: "600" }}>Route:</span>
                  <span>{selectedPayment.route_name || 'N/A'}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm)", backgroundColor: "var(--gray-light)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontWeight: "600" }}>Sacco:</span>
                  <span>{selectedPayment.sacco_name || 'N/A'}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm)", backgroundColor: "var(--gray-light)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontWeight: "600" }}>Phone:</span>
                  <span>{selectedPayment.phone || 'N/A'}</span>
                </div>
                
                {selectedPayment.created_at && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm)", backgroundColor: "var(--gray-light)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontWeight: "600" }}>Date:</span>
                      <span>{new Date(selectedPayment.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm)", backgroundColor: "var(--gray-light)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontWeight: "600" }}>Time:</span>
                      <span>{new Date(selectedPayment.created_at).toLocaleTimeString()}</span>
                    </div>
                  </>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm)", backgroundColor: "var(--gray-light)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontWeight: "600" }}>Payment ID:</span>
                  <span style={{ fontSize: "0.9rem", color: "var(--gray-medium)" }}>#{selectedPayment.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNameCapture = () => (
    <div className="card">
      <div className="text-center mb-4">
        <h2>Create Your Account</h2>
        <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
          Payment successful! Please enter your details to create your account.
        </p>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
        <div className="form-group">
          <label className="form-label">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            className="form-input"
            disabled={loading}
            style={{ 
              fontSize: "1.1rem",
              padding: "var(--spacing-md)",
              minHeight: "56px"
            }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
            className="form-input"
            disabled={loading}
            style={{ 
              fontSize: "1.1rem",
              padding: "var(--spacing-md)",
              minHeight: "56px"
            }}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Phone Number
          </label>
          <div style={{ 
            backgroundColor: "var(--gray-light)", 
            padding: "var(--spacing-md)", 
            borderRadius: "var(--radius-sm)",
            border: "2px solid var(--gray-light)",
            fontSize: "1.1rem",
            minHeight: "56px",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ color: "var(--gray-medium)", fontWeight: "500" }}>
              {phone}
            </span>
          </div>
        </div>
        
        {error && (
          <div style={{ 
            color: "var(--accent-salmon)", 
            backgroundColor: "#ffe6e6", 
            padding: "var(--spacing-md)", 
            borderRadius: "var(--radius-sm)",
            fontSize: "0.95rem",
            border: "1px solid #ffcccc",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xs)"
          }}>
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: "20px", height: "20px" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {error}
          </div>
        )}
        
        <button 
          className="btn btn-primary" 
          onClick={handleNameCapture}
          disabled={loading || !firstName.trim() || !lastName.trim()}
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            minHeight: "60px",
            marginTop: "var(--spacing-sm)"
          }}
        >
          {loading ? (
            <>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Creating Account...
            </>
          ) : (
            <>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Create Account
            </>
          )}
        </button>
        
        <button 
          className="btn btn-outline" 
          onClick={async () => {
            console.log("🔍 Manual payment status check");
            if (customer) {
              const paymentData = await loadPaymentHistory();
              console.log(`📊 Manual check: Payment history length: ${paymentData.length}`);
              if (paymentData.length > 0) {
                console.log("✅ Manual check: Payment found!");
                setError(""); // Clear any errors
              } else {
                console.log("❌ Manual check: No payment found");
                setError("No payment found. Please complete your payment first.");
              }
            } else {
              setError("No customer found. Please try making a payment first.");
            }
          }}
          style={{
            fontSize: "1rem",
            fontWeight: "500",
            minHeight: "50px",
            marginTop: "var(--spacing-xs)"
          }}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Check Payment Status
        </button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="card">
      <div className="text-center mb-3">
        <button 
          className="btn btn-outline" 
          onClick={() => setStep("home")} 
          disabled={loading}
          style={{ width: "auto", minHeight: "40px", padding: "var(--spacing-xs) var(--spacing-sm)" }}
        >
          <BackIcon />
          Back
        </button>
      </div>
      
      <h2 className="text-center mb-4">My Profile</h2>
      
      {isAuthenticated && customer ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div className="card" style={{ backgroundColor: "var(--gray-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-sm)" }}>
              <h3 style={{ color: "var(--accent-orange)", margin: 0 }}>
                Personal Information
              </h3>
              {!isEditingProfile && (
                <button 
                  className="btn btn-outline" 
                  onClick={handleEditProfile}
                  style={{ 
                    fontSize: "0.9rem", 
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                    minHeight: "auto"
                  }}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            
            {isEditingProfile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    value={editFirstName} 
                    onChange={(e) => setEditFirstName(e.target.value)} 
                    placeholder="Enter first name" 
                    className="form-input" 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    value={editLastName} 
                    onChange={(e) => setEditLastName(e.target.value)} 
                    placeholder="Enter last name" 
                    className="form-input" 
                    disabled={loading}
                  />
                </div>
                <div>
                  <strong>Phone Number:</strong> {customer.phone}
                </div>
                {error && (
                  <div style={{ 
                    color: "var(--accent-salmon)", 
                    backgroundColor: "#ffe6e6", 
                    padding: "var(--spacing-sm)", 
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem"
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveProfile}
                    disabled={loading || !editFirstName.trim() || !editLastName.trim()}
                    style={{ flex: 1 }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={handleCancelEdit}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
                <div>
                  <strong>Name:</strong> {customer.name || "Not provided"}
                </div>
                <div>
                  <strong>Phone Number:</strong> {customer.phone}
                </div>
              </div>
            )}
          </div>
          
          <div className="card" style={{ backgroundColor: "var(--gray-light)" }}>
            <h3 style={{ color: "var(--accent-orange)", marginBottom: "var(--spacing-sm)" }}>
              Account Status
            </h3>
            <p style={{ color: "var(--gray-medium)" }}>
              ✓ Account verified and active
            </p>
          </div>
          
          <button 
            className="btn btn-outline" 
            onClick={handleLogout}
            style={{ alignSelf: "center" }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "var(--spacing-lg)" }}>
          <p style={{ color: "var(--gray-medium)", marginBottom: "var(--spacing-md)" }}>
            Please make a payment to create your account
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => setStep("home")} 
            disabled={loading}
          >
            Go to Payment
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ 
      padding: step === "home" ? "0" : "var(--spacing-md)", 
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)"
    }}>
      {step === "home" && renderHome()}
      {step === "matatuCheck" && renderMatatuCheck()}
      {step === "payment" && renderPayment()}
      {step === "waiting" && renderWaiting()}
      {step === "confirmation" && renderConfirmation()}
      {step === "rate" && renderRateMatatu()}
      {step === "login" && renderLogin()}
      {step === "nameCapture" && renderNameCapture()}
      {step === "history" && renderPaymentHistory()}
      {step === "profile" && renderProfile()}
    </div>
  );
}
export default App;
