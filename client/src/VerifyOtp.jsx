import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ChatbotWidget from "./components/ChatbotWidget";
import api from "./api";
import "./Auth.css";

function VerifyOtp() {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email") || "";

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 5).split("");
      const newOtp = [...otpDigits];
      pasted.forEach((char, idx) => {
        if (idx < 5) newOtp[idx] = char;
      });
      setOtpDigits(newOtp);
      const nextFocus = Math.min(pasted.length, 4);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto advance focus
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 5) {
      setError("Please enter the complete 5-digit verification code.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    api
      .post("auth/verify-otp", { email, otp: fullOtp })
      .then((res) => {
        if (res.data?.success) {
          setMessage("Email verified successfully! Initializing security clearance...");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setError(res.data?.message || "Invalid or expired verification code.");
        }
      })
      .catch((err) => {
        console.error("Verify OTP error:", err);
        setError(err.response?.data?.message || "Verification failed. Invalid or expired OTP.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page">
      <ChatbotWidget />
      <header className="auth-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          🛡️ Safe<span className="logo-accent">Net</span>
        </div>
        <button className="auth-back-btn" onClick={() => navigate("/register")}>
          Back to Register
        </button>
      </header>

      <div className="auth-content">
        <div className="auth-container">
          <div className="auth-badge-pill">TWO-FACTOR CLEARANCE</div>
          <h2 className="auth-title">Verify Your Identity</h2>
          <p className="auth-subtitle">
            Enter the 5-digit authorization code dispatched to <br />
            <strong className="text-cyan">{email || "your registered email"}</strong>
          </p>

          {message && <div className="auth-success-message">{message}</div>}
          {error && <div className="auth-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="otp-inputs-grid">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="otp-digit-box"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Verifying Authorization Code..." : "Authorize Account"}
            </button>

            <p className="auth-link-text">
              Didn't receive the code?{" "}
              <Link to="/register" className="auth-link">
                Re-enter Email
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
