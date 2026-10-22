import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ChatbotWidget from "./components/ChatbotWidget";
import api from "./api";
import "./Auth.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    api
      .put(`/auth/password/reset/${token}`, {
        password,
        confirmPassword,
      })
      .then((result) => {
        if (result.data?.success || result.data?.Status) {
          setMessage("Password updated successfully! Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(result.data?.message || "Token expired or password update failed");
        }
      })
      .catch((err) => {
        console.error("Reset password error:", err);
        setError(err.response?.data?.message || "An error occurred. Please request a new reset link.");
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
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Define your new cryptographic security credentials</p>

          {message && <div className="auth-success-message">{message}</div>}
          {error && <div className="auth-error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Updating Credentials..." : "Update Password"}
            </button>

            <p className="auth-link-text">
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

export default ResetPassword;
