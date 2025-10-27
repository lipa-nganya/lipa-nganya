import React, { useState, useEffect } from 'react';
import './index.css';

// Backend URL - same as customer app
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7070';

// Icons as SVG components
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

const BackIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const BusIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z"/>
    <circle cx="9" cy="10" r="2"/>
    <circle cx="15" cy="10" r="2"/>
    <path d="M8 22h8"/>
  </svg>
);

const TripIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18"/>
    <circle cx="6" cy="12" r="2"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);

const MoneyIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const UserIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const HelpIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ReportIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const StarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [driver, setDriver] = useState(null);
  const [matatu, setMatatu] = useState(null);
  
  // UI state
  const [step, setStep] = useState("login"); // login, dashboard, transactions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Login state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [driverPin, setDriverPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  
  // Wallet and transaction state
  const [matatuWallet, setMatatuWallet] = useState(0);
  const [driverWallet, setDriverWallet] = useState(0);
  const [conductorWallet, setConductorWallet] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [paymentNotifications, setPaymentNotifications] = useState([]);
  
  // Data state
  const [payments, setPayments] = useState([]);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0
  });
  const [ratings, setRatings] = useState({
    average: 0,
    count: 0,
    recent: []
  });

  // Check if driver is authenticated on app load
  useEffect(() => {
    const savedDriver = localStorage.getItem('lipaNganyaDriver');
    if (savedDriver) {
      try {
        const driverData = JSON.parse(savedDriver);
        setDriver(driverData);
        setIsAuthenticated(true);
        setStep("dashboard");
        loadDriverData(driverData);
      } catch (error) {
        console.error('Error parsing saved driver:', error);
        localStorage.removeItem('lipaNganyaDriver');
      }
    }
  }, []);

  // Load driver data after authentication
  const loadDriverData = async (driverData) => {
    try {
      // Set matatu data from the driver data (already provided by backend)
      if (driverData.matatu) {
        setMatatu(driverData.matatu);
      } else if (driverData.matatu_id) {
        // Fallback: try to fetch matatu data if not provided
        try {
          const matatuResponse = await fetch(`${BACKEND_URL}/api/matatus/${driverData.matatu_id}`);
          if (matatuResponse.ok) {
            const matatuData = await matatuResponse.json();
            setMatatu(matatuData);
          }
        } catch (matatuErr) {
          console.log('No matatu data available, using mock data');
          // Set mock matatu data
          setMatatu({
            id: driverData.matatu_id || 1,
            number: "KCA123A",
            route_name: "Route 1",
            sacco_name: "Sacco A",
            routes: ["Route 1", "Route 2", "Route 3"]
          });
        }
      }
      
      // Load payments if matatu_id exists
      if (driverData.matatu_id) {
        await loadPayments(driverData.matatu_id);
        await loadEarnings(driverData.matatu_id);
        await loadRatings(driverData.matatu_id);
      }
      
      // Load wallet data
      await loadWalletData(driverData);
      
    } catch (err) {
      console.error('Error loading driver data:', err);
    }
  };

  // Load wallet data from backend
  const loadWalletData = async (driverData) => {
    try {
      console.log('🔍 Loading wallet data for:', driverData);
      
      // Load matatu wallet balance from LP wallet API
      const matatuResponse = await fetch(`${BACKEND_URL}/api/wallet/matatu/${driverData.matatu_id}/balance`);
      if (matatuResponse.ok) {
        const matatuData = await matatuResponse.json();
        console.log('✅ LP Matatu wallet data loaded:', matatuData);
        setMatatuWallet(matatuData.balance || 0);
      } else {
        console.error('❌ Failed to load LP matatu wallet data');
        setMatatuWallet(15000); // Fallback
      }
      
      // Load driver/conductor wallet data based on role
      const response = await fetch(`${BACKEND_URL}/api/wallet/balances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driverData.id,
          role: driverData.role,
          matatuId: driverData.matatu_id
        })
      });

      if (response.ok) {
        const walletData = await response.json();
        console.log('✅ Driver/Conductor wallet data loaded:', walletData);
        
        if (driverData.role === 'driver') {
          setDriverWallet(walletData.wallets.driverWallet || 0);
          setConductorWallet(0); // Driver doesn't see conductor wallet
        } else if (driverData.role === 'conductor') {
          setConductorWallet(walletData.wallets.conductorWallet || 0);
          setDriverWallet(0); // Conductor doesn't see driver wallet
        }
      } else {
        console.error('❌ Failed to load driver/conductor wallet data');
        // Fallback to mock data
        setDriverWallet(driverData.role === 'driver' ? 2500 : 0);
        setConductorWallet(driverData.role === 'conductor' ? 1800 : 0);
      }
      
      // Load recent transactions
      await loadWalletTransactions(driverData);
      
    } catch (err) {
      console.error('❌ Error loading wallet data:', err);
      // Fallback to mock data
      setMatatuWallet(15000);
      setDriverWallet(driverData.role === 'driver' ? 2500 : 0);
      setConductorWallet(driverData.role === 'conductor' ? 1800 : 0);
    }
  };

  // Load wallet transactions from backend
  const loadWalletTransactions = async (driverData) => {
    try {
      // Load LP matatu wallet transactions
      const matatuTransactionsResponse = await fetch(`${BACKEND_URL}/api/wallet/matatu/${driverData.matatu_id}/transactions?limit=5`);
      let lpTransactions = [];
      
      if (matatuTransactionsResponse.ok) {
        const matatuData = await matatuTransactionsResponse.json();
        console.log('✅ LP Matatu wallet transactions loaded:', matatuData);
        lpTransactions = matatuData.transactions.map(t => ({
          ...t,
          wallet_name: 'LP Matatu Wallet',
          wallet_type: 'matatu'
        }));
      }
      
      // Load driver/conductor wallet transactions
      const response = await fetch(`${BACKEND_URL}/api/wallet/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driverData.id,
          role: driverData.role,
          matatuId: driverData.matatu_id
        })
      });

      let otherTransactions = [];
      if (response.ok) {
        const transactionData = await response.json();
        console.log('✅ Driver/Conductor wallet transactions loaded:', transactionData);
        otherTransactions = transactionData.transactions || [];
      } else {
        console.error('❌ Failed to load driver/conductor wallet transactions');
      }
      
      // Combine LP transactions with other wallet transactions
      const allTransactions = [...lpTransactions, ...otherTransactions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10); // Show latest 10 transactions
      
      setRecentTransactions(allTransactions);
      
    } catch (err) {
      console.error('❌ Error loading wallet transactions:', err);
      // Fallback to mock data
      setRecentTransactions([
        {
          id: 1,
          wallet_name: 'LP Matatu Wallet',
          transaction_type: 'payment_received',
          amount: 50,
          description: 'Customer fare payment',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          wallet_name: 'LP Matatu Wallet',
          transaction_type: 'fuel_payment',
          amount: -2000,
          description: 'Fuel payment',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ]);
    }
  };

  // Load payments for the matatu
  const loadPayments = async (matatuId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matatus/${matatuId}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  // Load earnings summary
  const loadEarnings = async (matatuId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matatus/${matatuId}/earnings`);
      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error('Error loading earnings:', err);
    }
  };

  // Load ratings
  const loadRatings = async (matatuId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matatus/${matatuId}/ratings`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (err) {
      console.error('Error loading ratings:', err);
    }
  };

  // Setup PIN for new users
  const handlePinSetup = async () => {
    if (!driverPin || driverPin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/driver/setup-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          pin: driverPin
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("PIN setup successful");
        
        // Update driver data
        const updatedDriver = { ...driver, hasPin: true };
        setDriver(updatedDriver);
        localStorage.setItem('lipaNganyaDriver', JSON.stringify(updatedDriver));
        
        // Load driver data and go to dashboard
        await loadDriverData(updatedDriver);
        setStep("dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to setup PIN");
      }
    } catch (err) {
      console.error("❌ Error setting up PIN:", err);
      setError("PIN setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Driver/Conductor Login
  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send OTP
      const otpResponse = await fetch(`${BACKEND_URL}/api/driver/send-driver-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        }),
      });

      if (otpResponse.ok) {
        const otpData = await otpResponse.json();
        setOtpSent(true);
        console.log(`✅ OTP sent for phone ${phoneNumber}`);
        // For testing: show OTP in console
        if (otpData.otp) {
          console.log(`🔑 TESTING OTP: ${otpData.otp}`);
        }
      } else {
        const errorData = await otpResponse.json();
        setError(errorData.message || "Failed to send verification code");
      }
    } catch (err) {
      console.error("❌ Error during login:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete login
  const verifyDriverOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/driver/verify-driver-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          otp: otpCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save driver data and authenticate
        const driverData = {
          id: data.driver.id,
          name: data.driver.name,
          phone: phoneNumber,
          role: data.driver.role, // 'driver' or 'conductor'
          matatu_id: data.matatu?.id,
          matatu_number: data.matatu?.number,
          hasPin: data.driver.hasPin
        };

        setDriver(driverData);
        setIsAuthenticated(true);
        localStorage.setItem('lipaNganyaDriver', JSON.stringify(driverData));
        
        // Check if user needs to set up PIN
        if (!driverData.hasPin) {
          setNeedsPinSetup(true);
          setStep("pinSetup");
        } else {
          // Load driver data
          await loadDriverData(driverData);
          setStep("dashboard");
        }
        console.log(`✅ ${driverData.role} authenticated: ${driverData.name}`);
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("❌ Error verifying OTP:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setDriver(null);
    setMatatu(null);
    setIsAuthenticated(false);
    setPayments([]);
    setEarnings({ today: 0, week: 0, month: 0 });
    setRatings({ average: 0, count: 0, recent: [] });
    setMatatuWallet(0);
    setDriverWallet(0);
    setConductorWallet(0);
    setRecentTransactions([]);
    setPaymentNotifications([]);
    setOtpSent(false);
    setOtpCode("");
    setDriverPin("");
    setNeedsPinSetup(false);
    localStorage.removeItem('lipaNganyaDriver');
    setStep("login");
    console.log("✅ Driver logged out successfully");
  };

  // Toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle menu click
  const handleMenuClick = (menuStep) => {
    setStep(menuStep);
    setIsMenuOpen(false);
  };

  // Render login screen
  const renderLogin = () => (
    <div className="card">
      <div className="text-center mb-4">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-md)"
        }}>
          <BusIcon />
          <h2 style={{ margin: 0, color: "var(--accent-blue)" }}>Driver Portal</h2>
        </div>
        <div style={{
          backgroundColor: "#e3f2fd",
          padding: "var(--spacing-sm)",
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-md)",
          border: "2px solid var(--accent-blue)"
        }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--accent-blue)", fontWeight: "600" }}>
            🚐 MATATU DRIVER ACCESS
          </p>
        </div>
        <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
          Enter your phone number to access your driver/conductor dashboard
        </p>
      </div>
      
      {!otpSent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
            💡 We'll send you a verification code via SMS
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
              onClick={handleLogin}
              disabled={loading || !phoneNumber.trim()}
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
                <BusIcon />
                Login to Dashboard
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
            ✅ Verification code sent to {phoneNumber}
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
              onClick={verifyDriverOTP}
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
              <BackIcon />
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render PIN setup screen
  const renderPinSetup = () => (
    <div className="card">
      <div className="text-center mb-4">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--spacing-sm)",
          marginBottom: "var(--spacing-md)"
        }}>
          <svg className="icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: "32px", height: "32px", color: "var(--accent-blue)" }}>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <h2 style={{ margin: 0, color: "var(--accent-blue)" }}>Setup Security PIN</h2>
        </div>
        <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
          Create a 4-digit PIN to secure your transactions
        </p>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
        <div className="form-group">
          <label className="form-label">4-Digit PIN</label>
          <input
            type="password"
            className="form-input"
            value={driverPin}
            onChange={(e) => setDriverPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1234"
            disabled={loading}
            style={{ fontSize: "1.5rem", padding: "var(--spacing-md)", minHeight: "56px", textAlign: "center", letterSpacing: "0.5rem" }}
          />
        </div>
        
        <div style={{ 
          backgroundColor: "#e8f4fd", 
          padding: "var(--spacing-sm)", 
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--spacing-md)",
          fontSize: "0.9rem"
        }}>
          🔒 Your PIN will be encrypted and used to authorize all transactions
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
          onClick={handlePinSetup}
          disabled={loading || driverPin.length !== 4}
          style={{ fontSize: "1.1rem", fontWeight: "600", minHeight: "60px" }}
        >
          {loading ? (
            <>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Setting up PIN...
            </>
          ) : (
            <>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Complete Setup
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div>
      {/* Header with Hamburger Menu and Driver Info */}
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
        
        {/* Driver Info */}
        {driver && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)",
              marginBottom: "var(--spacing-xs)"
            }}>
              <BusIcon />
              <p style={{ 
                margin: 0, 
                fontSize: "1rem", 
                fontWeight: "600",
                color: "var(--accent-blue)"
              }}>
                {driver.name}
              </p>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: "0.85rem", 
              color: "var(--gray-medium)",
              backgroundColor: "#e3f2fd",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent-blue)"
            }}>
              🚐 {driver.matatu_number}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ marginTop: "80px", padding: "var(--spacing-md)" }}>
        {/* Wallet Overview */}
        <div className="card" style={{ marginBottom: "var(--spacing-lg)" }}>
          <h3 style={{ color: "var(--accent-blue)", marginBottom: "var(--spacing-md)" }}>Wallet Overview</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: driver?.role === 'driver' ? "1fr 1fr" : "1fr 1fr", 
            gap: "var(--spacing-md)" 
          }}>
            {/* LP Matatu Wallet - Always visible */}
            <div style={{ textAlign: "center", padding: "var(--spacing-md)", backgroundColor: "#e3f2fd", borderRadius: "var(--radius-sm)" }}>
              <h4 style={{ margin: 0, color: "var(--accent-blue)" }}>LP Matatu Wallet</h4>
              <p style={{ margin: "var(--spacing-xs) 0 0 0", fontSize: "1.5rem", fontWeight: "600" }}>{matatuWallet} KES</p>
            </div>
            
            {/* Driver Wallet - Only visible to drivers */}
            {driver?.role === 'driver' && (
              <div style={{ textAlign: "center", padding: "var(--spacing-md)", backgroundColor: "#e8f5e8", borderRadius: "var(--radius-sm)" }}>
                <h4 style={{ margin: 0, color: "var(--accent-green)" }}>Driver Wallet</h4>
                <p style={{ margin: "var(--spacing-xs) 0 0 0", fontSize: "1.5rem", fontWeight: "600" }}>{driverWallet} KES</p>
              </div>
            )}
            
            {/* Conductor Wallet - Only visible to conductors */}
            {driver?.role === 'conductor' && (
              <div style={{ textAlign: "center", padding: "var(--spacing-md)", backgroundColor: "#fff3e0", borderRadius: "var(--radius-sm)" }}>
                <h4 style={{ margin: 0, color: "var(--accent-orange)" }}>Conductor Wallet</h4>
                <p style={{ margin: "var(--spacing-xs) 0 0 0", fontSize: "1.5rem", fontWeight: "600" }}>{conductorWallet} KES</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-icon">
              <MoneyIcon />
            </div>
            <div className="dashboard-value">{earnings.today}</div>
            <div className="dashboard-label">Today's Earnings (KES)</div>
          </div>
          
          <div className="dashboard-card">
            <div className="dashboard-icon">
              <BusIcon />
            </div>
            <div className="dashboard-value">{payments.length}</div>
            <div className="dashboard-label">Total Payments</div>
          </div>
          
          <div className="dashboard-card">
            <div className="dashboard-icon">
              <StarIcon />
            </div>
            <div className="dashboard-value">{ratings.average.toFixed(1)}</div>
            <div className="dashboard-label">Average Rating</div>
          </div>
          
          <div className="dashboard-card">
            <div className="dashboard-icon">
              <TripIcon />
            </div>
            <div className="dashboard-value">{earnings.week}</div>
            <div className="dashboard-label">This Week (KES)</div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Payments</h3>
          </div>
          
          {payments.length === 0 ? (
            <div className="text-center">
              <p style={{ color: "var(--gray-medium)", fontSize: "0.9rem" }}>
                No payments recorded yet
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
              {payments.slice(0, 5).map((payment) => (
                <div 
                  key={payment.id} 
                  className="card" 
                  style={{ 
                    backgroundColor: payment.status === 'success' ? "#e8f5e8" : "#ffe6e6",
                    padding: "var(--spacing-sm)",
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flex: 1 }}>
                    <div style={{ 
                      padding: "4px 8px", 
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: payment.status === 'success' ? "var(--accent-green)" : "var(--accent-salmon)",
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
                        {payment.phone}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                      {payment.created_at ? new Date(payment.created_at).toLocaleTimeString() : 'Recent'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wallet Transactions */}
        <div className="card" style={{ marginTop: "var(--spacing-lg)" }}>
          <h3 style={{ color: "var(--accent-blue)", marginBottom: "var(--spacing-md)" }}>Recent Wallet Transactions</h3>
          {recentTransactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="card" 
                  style={{ 
                    backgroundColor: transaction.amount > 0 ? "#e8f5e8" : "#ffe6e6",
                    padding: "var(--spacing-sm)",
                    minHeight: "60px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flex: 1 }}>
                    <div style={{ 
                      padding: "4px 8px", 
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: transaction.amount > 0 ? "var(--accent-green)" : "var(--accent-salmon)",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      minWidth: "30px",
                      textAlign: "center"
                    }}>
                      {transaction.amount > 0 ? '+' : ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: "1rem" }}>
                        {transaction.wallet_name}
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.9rem", color: "var(--gray-medium)" }}>
                        {transaction.description}
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ 
                      margin: 0, 
                      fontWeight: "600", 
                      fontSize: "1.1rem",
                      color: transaction.amount > 0 ? "var(--accent-green)" : "var(--accent-salmon)"
                    }}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} KES
                    </p>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                      {transaction.transaction_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--gray-medium)", textAlign: "center", padding: "var(--spacing-lg)" }}>
              No recent transactions
            </p>
          )}
        </div>
      </div>

      {/* Hamburger Menu */}
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
              onClick={() => handleMenuClick("dashboard")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Dashboard
            </div>

            <div
              onClick={() => handleMenuClick("transactions")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              All Transactions
            </div>

            <div
              onClick={() => handleMenuClick("payments")}
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
              onClick={() => handleMenuClick("earnings")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Earnings
            </div>

            <div
              onClick={() => handleMenuClick("passengers")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Passengers
            </div>

            <div
              onClick={() => handleMenuClick("reports")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Report Issues
            </div>

            <div
              onClick={() => handleMenuClick("performance")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Performance
            </div>

            <div
              onClick={() => handleMenuClick("matatu-info")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Matatu Info
            </div>

            <div
              onClick={() => handleMenuClick("support")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Support
            </div>

            <div
              onClick={() => handleMenuClick("settings")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Settings
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
          </div>
        </div>
      )}
    </div>
  );

  // ✅ Render All Transactions Page
  const renderTransactions = () => (
    <div>
      {/* Header with Hamburger Menu and Driver Info */}
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
        
        {/* Driver Info */}
        {driver && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-xs)",
              marginBottom: "var(--spacing-xs)"
            }}>
              <BusIcon />
              <p style={{ 
                margin: 0, 
                fontSize: "1rem", 
                fontWeight: "600",
                color: "var(--accent-blue)"
              }}>
                {driver.name}
              </p>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: "0.85rem", 
              color: "var(--gray-medium)",
              backgroundColor: "#e3f2fd",
              padding: "2px 8px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--accent-blue)"
            }}>
              🚐 {driver.matatu_number}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ marginTop: "80px", padding: "var(--spacing-md)" }}>
        <div className="card">
          <div className="text-center mb-3">
            <button 
              className="btn btn-outline" 
              onClick={() => setStep("dashboard")} 
              disabled={loading}
              style={{ width: "auto", minHeight: "40px", padding: "var(--spacing-xs) var(--spacing-sm)" }}
            >
              <BackIcon />
              Back to Dashboard
            </button>
          </div>
          
          <h2 className="text-center mb-4">All Transactions</h2>
          
          {/* Transactions List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            {payments.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "var(--spacing-lg)",
                color: "var(--gray-medium)"
              }}>
                No transactions found
              </div>
            ) : (
              payments.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="card" 
                  style={{ 
                    backgroundColor: "var(--gray-light)",
                    borderLeft: `4px solid ${
                      transaction.status === 'success' ? 'var(--accent-green)' :
                      transaction.status === 'pending' ? 'var(--accent-orange)' :
                      'var(--accent-salmon)'
                    }`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-xs)" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>
                        Customer Payment
                      </h4>
                      <p style={{ margin: "var(--spacing-xs) 0 0 0", fontSize: "0.9rem", color: "var(--gray-medium)" }}>
                        Phone: {transaction.phone}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
                        {transaction.amount} KES
                      </p>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        padding: "2px 8px", 
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: 
                          transaction.status === 'success' ? '#e8f5e8' :
                          transaction.status === 'pending' ? '#fff3e0' :
                          '#ffebee',
                        color: 
                          transaction.status === 'success' ? 'var(--accent-green)' :
                          transaction.status === 'pending' ? 'var(--accent-orange)' :
                          'var(--accent-salmon)'
                      }}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--gray-medium)" }}>
                    <div>
                      {transaction.mpesa_transaction_id && (
                        <div>M-Pesa ID: {transaction.mpesa_transaction_id}</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                      <div>{new Date(transaction.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Hamburger Menu */}
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
              onClick={() => handleMenuClick("dashboard")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Dashboard
            </div>

            <div
              onClick={() => handleMenuClick("transactions")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              All Transactions
            </div>

            <div
              onClick={() => handleMenuClick("payments")}
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
              onClick={() => handleMenuClick("earnings")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Earnings
            </div>

            <div
              onClick={() => handleMenuClick("passengers")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Passengers
            </div>

            <div
              onClick={() => handleMenuClick("reports")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Reports
            </div>

            <div
              onClick={() => handleMenuClick("performance")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Performance
            </div>

            <div
              onClick={() => handleMenuClick("matatu-info")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Matatu Info
            </div>

            <div
              onClick={() => handleMenuClick("support")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Support
            </div>

            <div
              onClick={() => handleMenuClick("settings")}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500"
              }}
            >
              Settings
            </div>

            <div
              onClick={handleLogout}
              style={{
                padding: "var(--spacing-sm)",
                cursor: "pointer",
                fontSize: "1.1rem",
                fontWeight: "500",
                color: "var(--accent-salmon)",
                borderTop: "1px solid var(--border-color)",
                marginTop: "var(--spacing-sm)",
                paddingTop: "var(--spacing-md)"
              }}
            >
              Logout
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="App">
      {step === "login" && renderLogin()}
      {step === "pinSetup" && renderPinSetup()}
      {step === "dashboard" && renderDashboard()}
      {step === "transactions" && renderTransactions()}
      
      {/* Add more step renders here for other screens */}
    </div>
  );
}

export default App;