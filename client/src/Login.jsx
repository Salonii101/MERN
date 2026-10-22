import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import ChatbotWidget from "./components/ChatbotWidget";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    api
      .post("auth/login", { email, password })
      .then((result) => {
        if (result.data?.success) {
          navigate("/home");
        } else {
          setError(result.data?.message || "Invalid email or password.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        setError(err.response?.data?.message || "Authentication failed. Please check credentials.");
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
          <div className="auth-badge-pill">OPERATOR CLEARANCE</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Authenticate to access your cyber command dashboard</p>

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

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="forgot-password-link">
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Verifying Credentials..." : "Authenticate & Sign In"}
            </button>

            <div className="auth-divider">OR</div>

            <p className="auth-link-text">
              Request new security clearance?{" "}
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
