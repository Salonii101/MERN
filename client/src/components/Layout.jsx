import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import api from "../api";
import {
  ShieldIcon,
  ShieldCheckIcon,
  CloudIcon,
  CpuIcon,
  BotIcon,
  LogOutIcon,
  ZapIcon,
  LockIcon,
  SearchIcon
} from "./Icons";
import "./Layout.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const cursorGlowRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data?.user) {
          setCurrentUser(res.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (e) {
      console.warn("Logout request error:", e);
    }
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login");
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${e.clientX}px`;
        cursorGlowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/home", Icon: ShieldIcon },
    { label: "AI Threat Scanner", path: "/scanner", Icon: SearchIcon },
    { label: "Cloud Vault", path: "/upload", Icon: CloudIcon },
    { label: "AI Sentinel Chat", path: "/chatbot", Icon: BotIcon },
  ];

  return (
    <div className="layout">
      {/* 3D Cursor Glow */}
      <div ref={cursorGlowRef} className="cursor-glow"></div>

      {/* Floating AI Sentinel Chatbot Widget */}
      <ChatbotWidget />

      {/* Header/Navbar */}
      <header className="layout-header">
        <div className="layout-logo" onClick={() => navigate("/")}>
          <div className="logo-shield">
            <ShieldCheckIcon size={20} color="#22d3ee" />
          </div>
          <span className="logo-text">Safe<span className="logo-accent">Net</span></span>
          <span className="logo-badge">PRO</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="layout-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const ItemIcon = item.Icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-link ${isActive ? "active-nav" : ""}`}
              >
                <ItemIcon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {currentUser ? (
            <div className="user-profile-badge">
              <span className="user-dot"></span>
              <span className="user-name">{currentUser.name || "User"}</span>
              <button onClick={handleLogout} className="logout-pill" title="Sign Out">
                <LogOutIcon size={14} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="nav-link logout-btn">
              <LogOutIcon size={15} />
              <span>Logout</span>
            </button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {navItems.map((item) => {
            const ItemIcon = item.Icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`mobile-nav-link ${location.pathname === item.path ? "active" : ""}`}
              >
                <ItemIcon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button onClick={handleLogout} className="mobile-nav-link logout">
            <LogOutIcon size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="layout-content">{children}</main>

      {/* Cyber Footer */}
      <footer className="layout-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <ShieldCheckIcon size={20} color="#22d3ee" />
              <span>Safe<span className="logo-accent">Net</span></span>
            </div>
            <p className="footer-tagline">
              Zero-Trust Threat Defense, Client-Side Encrypted Cloud Vault, and AI Security Intelligence.
            </p>
            <div className="footer-security-badges">
              <span className="badge-item"><LockIcon size={13} /> AES-256-GCM</span>
              <span className="badge-item"><ZapIcon size={13} /> Cloudinary CDN</span>
              <span className="badge-item"><CloudIcon size={13} /> AWS S3 Storage</span>
              <span className="badge-item"><CpuIcon size={13} /> Gemini AI</span>
            </div>
            <p className="footer-copyright">© {new Date().getFullYear()} SafeNet Security Platform. All Rights Reserved.</p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Security Hub</h4>
              <button onClick={() => navigate("/scanner")} className="footer-link-btn">Threat Scanner</button>
              <button onClick={() => navigate("/upload")} className="footer-link-btn">Encrypted Cloud Vault</button>
              <button onClick={() => navigate("/chatbot")} className="footer-link-btn">AI Security Sentinel</button>
            </div>
            <div className="footer-column">
              <h4>Platform</h4>
              <button onClick={() => navigate("/home")} className="footer-link-btn">Dashboard</button>
              <button onClick={() => navigate("/register")} className="footer-link-btn">Create Account</button>
              <button onClick={() => navigate("/login")} className="footer-link-btn">Sign In</button>
            </div>
            <div className="footer-column">
              <h4>Status</h4>
              <a href="mailto:support@safenet.security">support@safenet.security</a>
              <span className="uptime-pill">● All Security Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
