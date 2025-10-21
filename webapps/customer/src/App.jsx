import { useState } from "react";

// ✅ Automatically choose backend URL based on environment
const LOCAL_URL = "http://localhost:7070";
const SERVER_URL = "https://lipa-nganya-api.onrender.com";
const BACKEND_URL = window.location.hostname === "localhost" ? LOCAL_URL : SERVER_URL;

function App() {
  const [step, setStep] = useState("home"); // home, matatuCheck, payment, confirmation, rate
  const [matatuNumber, setMatatuNumber] = useState("");
  const [matatuDetails, setMatatuDetails] = useState(null);
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

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
    if (!phone || !amount) {
      setError("Phone number and amount are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${BACKEND_URL}/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount,
          matatuNumber: matatuDetails.matatu_number,
          customerId: 1, // Replace with actual logged-in customer ID later
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const dateTime = new Date().toLocaleString();
        setConfirmation({
          matatuNumber: matatuDetails.matatu_number,
          amount,
          dateTime,
        });
        setStep("confirmation");
      } else {
        setError(data.error || "Failed to initiate payment");
      }
    } catch (err) {
      console.error(err);
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
      const response = await fetch(`${BACKEND_URL}/api/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: 1, // Replace later with actual logged-in customer
          matatu_number: matatuNumber,
          rating,
          comment,
        }),
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

  // ✅ Renders
  const renderHome = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <button onClick={handlePayFareClick} disabled={loading}>Pay Fare</button>
      <button onClick={handleRateMatatuClick} disabled={loading}>Rate Matatu</button>
      <button onClick={() => alert("Contact Support coming soon")} disabled={loading}>Contact Support</button>
    </div>
  );

  const renderMatatuCheck = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Enter Matatu Number</h2>
      <input
        type="text"
        value={matatuNumber}
        onChange={(e) => setMatatuNumber(e.target.value)}
        placeholder="Matatu Number"
        disabled={loading}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleCheckMatatu} disabled={loading}>
        {loading ? "Checking..." : "Confirm"}
      </button>
      <button onClick={() => setStep("home")} disabled={loading}>Cancel</button>
    </div>
  );

  const renderPayment = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Confirm Matatu Details</h2>
      <p>Number: {matatuDetails.matatu_number}</p>
      <p>Route: {matatuDetails.route_name}</p>
      <p>Sacco: {matatuDetails.sacco_name}</p>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number"
        disabled={loading}
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount (KES)"
        disabled={loading}
      />
      <p>You will receive a prompt to enter your M-PESA PIN.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing payment..." : "Pay Now"}
      </button>
      <button onClick={() => setStep("home")} disabled={loading}>Cancel</button>
    </div>
  );

  const renderConfirmation = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Payment Successful!</h2>
      <p>
        {confirmation.amount} KES paid to Matatu {confirmation.matatuNumber} <br />
        at {confirmation.dateTime}
      </p>
      <button onClick={() => setStep("home")}>Dismiss</button>
    </div>
  );

  const renderRateMatatu = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>Rate a Matatu</h2>
      <input
        type="text"
        value={matatuNumber}
        onChange={(e) => setMatatuNumber(e.target.value)}
        placeholder="Enter Matatu Number"
        disabled={loading}
      />
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        disabled={loading}
      >
        <option value="">Select rating</option>
        <option value="1">1 - Poor</option>
        <option value="2">2 - Fair</option>
        <option value="3">3 - Good</option>
        <option value="4">4 - Very Good</option>
        <option value="5">5 - Excellent</option>
      </select>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment"
        disabled={loading}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSubmitRating} disabled={loading}>
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
      <button onClick={() => setStep("home")} disabled={loading}>Cancel</button>
    </div>
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Lipa Nganya</h1>
      {step === "home" && renderHome()}
      {step === "matatuCheck" && renderMatatuCheck()}
      {step === "payment" && renderPayment()}
      {step === "confirmation" && renderConfirmation()}
      {step === "rate" && renderRateMatatu()}
    </div>
  );
}

export default App;
