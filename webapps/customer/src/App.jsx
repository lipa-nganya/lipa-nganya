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

function App() {
  const [step, setStep] = useState("home"); // home, matatuCheck, payment, confirmation, rate, history, login
  const [matatuNumber, setMatatuNumber] = useState("");
  const [matatuDetails, setMatatuDetails] = useState(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Initialize Google Sign-In
  useEffect(() => {
    // Make handleGoogleSignIn globally available
    window.handleGoogleSignIn = handleGoogleSignIn;
    
    // Initialize Google Identity Services when component mounts
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "your-google-client-id", // Replace with actual client ID
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }, []);

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

  const handleLogout = () => {
    setUser(null);
    setCustomer(null);
    setPaymentHistory([]);
    setStep("home");
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async (response) => {
    setLoading(true);
    setError("");

    try {
      // Verify token with backend
      const verifyResponse = await fetch(`${BACKEND_URL}/api/customers/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await verifyResponse.json();

      if (verifyResponse.ok) {
        setUser(data.user);
        
        // Try to find customer by phone number if available
        if (phone) {
          await findCustomerByPhone(phone, data.user.name, data.user.email);
        }
        
        setStep("home");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Find or create customer by phone
  const findCustomerByPhone = async (phoneNumber, name, email) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/customers/create-or-find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phoneNumber, 
          name: name || null, 
          email: email || null 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomer(data.customer);
        return data.customer;
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
        const dateTime = new Date().toLocaleString();
        setConfirmation({
          matatuNumber: matatuDetails.matatu_number,
          amount,
          dateTime,
        });
        
        // Try to find customer by phone after payment
        if (!customer) {
          await findCustomerByPhone(sanitizedPhone);
        }
        
        setStep("confirmation");
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
    <div className="card">
      <div className="text-center mb-4">
        <h1>
          <span className="text-primary">Lipa</span>{" "}
          <span className="text-salmon">Nganya</span>
        </h1>
        <p style={{ color: "var(--gray-medium)", fontSize: "1.1rem" }}>
          Cashless Matatu Payments & Ratings
        </p>
        
        {/* User info */}
        {user && (
          <div style={{ 
            backgroundColor: "var(--gray-light)", 
            padding: "var(--spacing-sm)", 
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--spacing-md)"
          }}>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              Welcome, {user.name || customer?.name || "User"}!
            </p>
            {customer && (
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                Phone: {customer.phone}
              </p>
            )}
          </div>
        )}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
        <button 
          className="btn btn-primary" 
          onClick={handlePayFareClick} 
          disabled={loading}
        >
          <PayIcon />
          Pay Fare
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={handleRateMatatuClick} 
          disabled={loading}
        >
          <RateIcon />
          Rate Matatu
        </button>
        
        {user ? (
          <>
            <button 
              className="btn btn-outline" 
              onClick={handleHistoryClick} 
              disabled={loading}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                <path d="M9 1v6M15 1v6M9 17v6M15 17v6"/>
              </svg>
              Payment History
            </button>
            
            <button 
              className="btn btn-outline" 
              onClick={handleLogout} 
              disabled={loading}
              style={{ color: "var(--accent-salmon)", borderColor: "var(--accent-salmon)" }}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </>
        ) : (
          <button 
            className="btn btn-outline" 
            onClick={handleLoginClick} 
            disabled={loading}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login with Google
          </button>
        )}
        
        <button 
          className="btn btn-outline" 
          onClick={() => alert("Contact Support coming soon")} 
          disabled={loading}
        >
          <SupportIcon />
          Contact Support
        </button>
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
      // For now, simulate Google Sign-In with mock data
      // In production, this would use real Google OAuth
      setLoading(true);
      setError("");
      
      setTimeout(() => {
        const mockGoogleUser = {
          id: "google_" + Date.now(),
          email: "user@gmail.com",
          name: "Google User",
          verified: true
        };
        
        handleGoogleSignIn({ credential: "mock_credential_" + Date.now() });
        setLoading(false);
      }, 1000);
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

  return (
    <div style={{ 
      padding: "var(--spacing-md)", 
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary)"
    }}>
      {step === "home" && renderHome()}
      {step === "matatuCheck" && renderMatatuCheck()}
      {step === "payment" && renderPayment()}
      {step === "confirmation" && renderConfirmation()}
      {step === "rate" && renderRateMatatu()}
      {step === "login" && renderLogin()}
      {step === "history" && renderPaymentHistory()}
    </div>
  );
}
export default App;
