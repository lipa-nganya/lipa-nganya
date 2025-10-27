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
  
  // Authentication state - phone-based
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

    setLoading(true);
    setError("");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const customerData = await findCustomerByPhone(phone, fullName);
      
      if (customerData) {
        setStep("profile");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      console.error("Error creating account:", err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setCustomer(null);
    setIsAuthenticated(false);
    setPaymentHistory([]);
    localStorage.removeItem('lipaNganyaCustomer');
    setStep("home");
  };

  // Find or create customer by phone
  const findCustomerByPhone = async (phoneNumber, name = null) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/create-or-find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          name: name || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const customerData = data.customer;
        saveCustomerAndAuthenticate(customerData);
        return customerData;
      }
    } catch (err) {
      console.error("Error finding customer:", err);
    }
  };

  // Load payment history
  const loadPaymentHistory = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/${customer.id}/payments`);
      const data = await response.json();

      if (response.ok) {
        setPaymentHistory(data);
      } else {
        setError("Failed to load payment history");
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
      setError("Failed to load payment history");
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
        if (!customer) {
          await findCustomerByPhone(sanitizedPhone);
        }
        
        // Set up a timeout to check payment status after 30 seconds
        setTimeout(async () => {
          try {
            // Check if payment was actually successful by looking for payment record
            if (customer) {
              await loadPaymentHistory();
              // If we have payment history, payment was successful
              if (paymentHistory.length > 0) {
                if (!isAuthenticated) {
                  setStep("nameCapture");
                } else {
                  setStep("profile");
                }
              } else {
                setError("Payment may not have been completed. Please check your phone and try again.");
                setStep("payment");
              }
            } else {
              setError("Please check your phone for the M-Pesa prompt. If you don't see it, the payment may have timed out. Please try again.");
              setStep("payment");
            }
          } catch (err) {
            console.error("Error checking payment status:", err);
            setError("Payment status could not be verified. Please check your payment history.");
            setStep("payment");
          }
        }, 30000); // Wait 30 seconds before showing timeout message
        
      } else {
        setError(data.message || "Failed to initiate payment");
        console.error("STK Push failed:", data);
      }
    } catch (err) {
      console.error("Failed to connect to server:", err);
      setError("Failed to connect to server.");
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
      {/* Header with Hamburger Menu */}
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
        justifyContent: "flex-start",
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

            <div
              onClick={() => handleMenuClick(isAuthenticated ? "history" : "home")}
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

            {isAuthenticated && (
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

        {/* User info */}
        {isAuthenticated && customer && (
          <div className="card" style={{ 
            backgroundColor: "var(--gray-light)", 
            textAlign: "center"
          }}>
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>
              Welcome, {customer.name || "Customer"}!
            </p>
            <p style={{ margin: "var(--spacing-xs) 0 0 0", fontSize: "0.9rem", color: "var(--gray-medium)" }}>
              Phone: {customer.phone}
            </p>
          </div>
        )}
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
          marginBottom: "var(--spacing-md)"
        }}>
          {error}
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

  const renderLogin = () => {
    const handleGoogleClick = () => {
      console.log("🔍 Google Sign-In button clicked");
      
      if (window.google && window.google.accounts) {
        try {
          // Clear any existing prompts first
          window.google.accounts.id.cancel();
          
          // Use renderButton for more reliable popup
          const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "777996667711-e61l268f50fhsiih0jgjd2ltjmapfst2.apps.googleusercontent.com";
          
          // Create a temporary button element for Google Sign-In
          const tempDiv = document.createElement('div');
          tempDiv.style.display = 'none';
          document.body.appendChild(tempDiv);
          
          window.google.accounts.id.renderButton(tempDiv, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'signin_with',
            width: 300
          });
          
          // Trigger click on the rendered button
          setTimeout(() => {
            const googleButton = tempDiv.querySelector('div[role="button"]');
            if (googleButton) {
              googleButton.click();
            } else {
              // Fallback to prompt if button rendering fails
              window.google.accounts.id.prompt();
            }
            document.body.removeChild(tempDiv);
          }, 100);
          
        } catch (error) {
          console.error("❌ Error with Google Sign-In:", error);
          // Fallback to prompt
          window.google.accounts.id.prompt();
        }
      } else {
        console.error("❌ Google Sign-In not available");
        setError("Google Sign-In is not available. Please refresh the page and try again.");
      }
    };

    return (
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
        
        <h2 className="text-center mb-4">Login with Google</h2>
        
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
          <p style={{ color: "var(--gray-medium)", marginBottom: "var(--spacing-md)" }}>
            Sign in to view your payment history and manage your account
          </p>
          
          <button 
            className="btn btn-primary" 
            onClick={handleGoogleClick}
            disabled={loading}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "var(--spacing-xs)",
              backgroundColor: "#4285f4",
              border: "none"
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285f4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fbbc05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
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
      </div>
    );
  };

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
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
          {paymentHistory.map((payment) => (
            <div 
              key={payment.id} 
              className="card" 
              style={{ 
                backgroundColor: payment.status === 'success' ? "#e8f5e8" : "#ffe6e6",
                padding: "var(--spacing-sm)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "600" }}>
                    {payment.amount} KES
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--gray-medium)" }}>
                    {payment.route_name} - {payment.sacco_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ 
                  padding: "var(--spacing-xs)", 
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: payment.status === 'success' ? "var(--accent-orange)" : "var(--accent-salmon)",
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: "600"
                }}>
                  {payment.status === 'success' ? '✓ Paid' : '✗ Failed'}
                </div>
              </div>
            </div>
          ))}
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
            <h3 style={{ color: "var(--accent-orange)", marginBottom: "var(--spacing-sm)" }}>
              Personal Information
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              <div>
                <strong>Name:</strong> {customer.name || "Not provided"}
              </div>
              <div>
                <strong>Phone Number:</strong> {customer.phone}
              </div>
            </div>
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
