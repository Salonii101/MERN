import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatbotWidget from "./components/ChatbotWidget";
import api from "./api";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    api
      .post("/auth/forgot-password", { email })
      .then((result) => {
        if (result.data?.success) {
          setMessage("Password reset token generated and sent to your email!");
          setTimeout(() => navigate("/login"), 3500);
        } else {
          setError(result.data?.message || "Failed to send reset email.");
        }
      })
      .catch((err) => {
        console.error("Forgot password error:", err);
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
        <button className="auth-back-btn" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </header>

      <div className="auth-content">
        <div className="auth-container">
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            Enter your registered email and we'll dispatch a cryptographic reset token.
          </p>

          {message && <div className="auth-success-message">{message}</div>}
          {error && <div className="auth-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="analyst@safenet.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Dispatching Token..." : "Send Reset Token"}
            </button>

            <p className="auth-link-text">
              Remember your credentials?{" "}
              <Link to="/login" className="auth-link">
                Back to Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
