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
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Login state
  const [matatuNumber, setMatatuNumber] = useState("");
  const [driverPin, setDriverPin] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // Trip state
  const [currentTrip, setCurrentTrip] = useState(null);
  const [isTripActive, setIsTripActive] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState("");
  
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
      // Load matatu information
      const matatuResponse = await fetch(`${BACKEND_URL}/api/matatus/${driverData.matatu_id}`);
      if (matatuResponse.ok) {
        const matatuData = await matatuResponse.json();
        setMatatu(matatuData);
      }
      
      // Load payments
      await loadPayments(driverData.matatu_id);
      
      // Load earnings
      await loadEarnings(driverData.matatu_id);
      
      // Load ratings
      await loadRatings(driverData.matatu_id);
    } catch (err) {
      console.error('Error loading driver data:', err);
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

  // Driver authentication
  const handleDriverLogin = async () => {
    if (!matatuNumber.trim()) {
      setError("Please enter your matatu number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First, verify matatu exists
      const matatuResponse = await fetch(`${BACKEND_URL}/api/matatus/search?number=${matatuNumber}`);
      if (!matatuResponse.ok) {
        setError("Matatu number not found");
        return;
      }

      const matatuData = await matatuResponse.json();
      
      // Send OTP for verification
      const otpResponse = await fetch(`${BACKEND_URL}/api/auth/send-driver-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matatuNumber: matatuNumber,
          matatuId: matatuData.id
        }),
      });

      if (otpResponse.ok) {
        setOtpSent(true);
        console.log(`✅ OTP sent for matatu ${matatuNumber}`);
        // For testing: show OTP in console
        if (data.otp) {
          console.log(`🔑 TESTING OTP: ${data.otp}`);
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
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-driver-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matatuNumber: matatuNumber,
          otp: otpCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save driver data and authenticate
        const driverData = {
          id: data.driver.id,
          name: data.driver.name,
          phone: data.driver.phone,
          matatu_id: data.matatu.id,
          matatu_number: matatuNumber
        };

        setDriver(driverData);
        setIsAuthenticated(true);
        localStorage.setItem('lipaNganyaDriver', JSON.stringify(driverData));
        
        // Load driver data
        await loadDriverData(driverData);
        
        setStep("dashboard");
        console.log(`✅ Driver authenticated: ${driverData.name}`);
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
    setCurrentTrip(null);
    setIsTripActive(false);
    setPayments([]);
    setEarnings({ today: 0, week: 0, month: 0 });
    setRatings({ average: 0, count: 0, recent: [] });
    localStorage.removeItem('lipaNganyaDriver');
    setStep("login");
    console.log("✅ Driver logged out");
  };

  // Start trip
  const startTrip = async () => {
    if (!selectedRoute) {
      setError("Please select a route");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/trips/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matatuId: driver.matatu_id,
          route: selectedRoute,
          driverId: driver.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentTrip(data.trip);
        setIsTripActive(true);
        console.log(`✅ Trip started: ${selectedRoute}`);
      } else {
        setError(data.message || "Failed to start trip");
      }
    } catch (err) {
      console.error("❌ Error starting trip:", err);
      setError("Failed to start trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // End trip
  const endTrip = async () => {
    if (!currentTrip) {
      setError("No active trip to end");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/trips/${currentTrip.id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripCount: 1 // This would be calculated based on actual passengers
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentTrip(null);
        setIsTripActive(false);
        setSelectedRoute("");
        console.log(`✅ Trip ended successfully`);
        
        // Reload earnings
        await loadEarnings(driver.matatu_id);
      } else {
        setError(data.message || "Failed to end trip");
      }
    } catch (err) {
      console.error("❌ Error ending trip:", err);
      setError("Failed to end trip. Please try again.");
    } finally {
      setLoading(false);
    }
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
          Enter your matatu number to access your driver dashboard
        </p>
      </div>
      
      {!otpSent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <div className="form-group">
            <label className="form-label">Matatu Number</label>
            <input
              type="text"
              className="form-input"
              value={matatuNumber}
              onChange={(e) => setMatatuNumber(e.target.value.toUpperCase())}
              placeholder="KCA 123A"
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
            onClick={handleDriverLogin}
            disabled={loading || !matatuNumber.trim()}
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
            ✅ Verification code sent for {matatuNumber}
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
        {/* Trip Status */}
        <div className="card">
          <div className="trip-status" style={{ 
            backgroundColor: isTripActive ? "#d4edda" : "#f8d7da",
            border: `2px solid ${isTripActive ? "var(--accent-green)" : "var(--accent-salmon)"}`
          }}>
            <div className={`trip-indicator ${isTripActive ? 'active' : 'inactive'}`}></div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
                {isTripActive ? "Trip Active" : "No Active Trip"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--gray-medium)" }}>
                {isTripActive ? `Route: ${currentTrip?.route}` : "Ready to start trip"}
              </p>
            </div>
          </div>
          
          {!isTripActive ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
              <div className="form-group">
                <label className="form-label">Select Route</label>
                <select
                  className="form-input"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  style={{ fontSize: "1rem", padding: "var(--spacing-sm)" }}
                >
                  <option value="">Choose route...</option>
                  {matatu && matatu.routes?.map((route, index) => (
                    <option key={index} value={route}>{route}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-success" 
                onClick={startTrip}
                disabled={loading || !selectedRoute}
                style={{ fontSize: "1.1rem", fontWeight: "600" }}
              >
                <TripIcon />
                Start Trip
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-danger" 
              onClick={endTrip}
              disabled={loading}
              style={{ fontSize: "1.1rem", fontWeight: "600" }}
            >
              <TripIcon />
              End Trip
            </button>
          )}
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

  // Main render
  return (
    <div className="App">
      {step === "login" && renderLogin()}
      {step === "dashboard" && renderDashboard()}
      
      {/* Add more step renders here for other screens */}
    </div>
  );
}

export default App;