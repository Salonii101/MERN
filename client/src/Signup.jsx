import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import ChatbotWidget from "./components/ChatbotWidget";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, text: "Weak", color: "#f43f5e" };
    if (score <= 2) return { level: 2, text: "Moderate", color: "#f59e0b" };
    if (score <= 3) return { level: 3, text: "Strong", color: "#38bdf8" };
    return { level: 4, text: "Very Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    api
      .post("auth/register", { name, email, password })
      .then((result) => {
        if (result.data?.success) {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } else {
          setError(result.data?.message || "Registration failed.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Registration error:", err);
        setError(err.response?.data?.message || "User already exists or registration failed.");
        setLoading(false);
      });
  };

  return (
    <div className="auth-page">
      <ChatbotWidget />
      <header className="auth-header">
        <div className="auth-logo" onClick={() => navigate("/")}>
          🛡️ Safe<span className="logo-accent">Net</span>
        </div>
        <button className="auth-back-btn" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </header>

      <div className="auth-content">
        <div className="auth-container">
          <div className="auth-badge-pill">NEW USER PROVISIONING</div>
          <h2 className="auth-title">Create Clearance Account</h2>
          <p className="auth-subtitle">
            Join the zero-trust cybersecurity network and protect your assets.
          </p>

          {error && <div className="auth-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Agent / Analyst Name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="analyst@domain.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Master Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create a robust master key"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password && (
                <div className="password-strength-bar">
                  <div className="strength-indicators">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="strength-step"
                        style={{
                          backgroundColor:
                            step <= strength.level ? strength.color : "rgba(255,255,255,0.1)",
                        }}
                      ></div>
                    ))}
                  </div>
                  <span className="strength-text" style={{ color: strength.color }}>
                    {strength.text}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Generating Account & Dispatched OTP..." : "Create Account"}
            </button>

            <div className="auth-divider">OR</div>

            <p className="auth-link-text">
              Already possess clearance?{" "}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
