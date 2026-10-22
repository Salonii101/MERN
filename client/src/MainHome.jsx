import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatbotWidget from "./components/ChatbotWidget";
import ParticleBackground from "./components/ParticleBackground";
import MeshBackground from "./components/MeshBackground";
import Typewriter from "./components/Typewriter";
import TiltCard from "./components/TiltCard";
import {
  ShieldCheckIcon,
  ShieldIcon,
  SearchIcon,
  LockIcon,
  CloudIcon,
  BotIcon,
  ZapIcon,
  CpuIcon,
  ArrowRightIcon,
  ChartIcon
} from "./components/Icons";
import "./MainHome.css";

function MainHome() {
  const navigate = useNavigate();
  const [blockedThreats, setBlockedThreats] = useState(1482930);
  const [scannedFiles, setScannedFiles] = useState(628410);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockedThreats((prev) => prev + Math.floor(Math.random() * 3));
      setScannedFiles((prev) => prev + Math.floor(Math.random() * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-home">
      {/* Dynamic Backgrounds */}
      <MeshBackground />
      <ParticleBackground />

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />

      {/* Top Cyber Navigation */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          <div className="logo-orb">
            <ShieldCheckIcon size={20} color="#22d3ee" />
          </div>
          <span className="logo-title">Safe<span className="gradient-text">Net</span></span>
          <span className="pill-badge">AI DEFENSE</span>
        </div>

        <div className="header-buttons">
          <button onClick={() => navigate("/scanner")} className="btn-header cyber-btn-outline">
            <span className="btn-icon"><SearchIcon size={14} /></span> Try Scanner
          </button>
          <button onClick={() => navigate("/upload")} className="btn-header cyber-btn-outline">
            <span className="btn-icon"><LockIcon size={14} /></span> Cloud Vault
          </button>
          <button onClick={() => navigate("/login")} className="btn-header">
            Sign In
          </button>
          <button onClick={() => navigate("/register")} className="btn-header btn-primary-gradient">
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section with 3D Cyber Shield */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-indicator"></span>
            <span>NEXT-GEN CYBER DEFENSE PLATFORM</span>
          </div>

          <h1 className="hero-title">
            Zero-Trust Threat Defense &amp; <span className="gradient-text">Encrypted Cloud Vault</span>
          </h1>

          <div className="hero-description">
            <Typewriter
              texts={[
                "AI-driven malware detection powered by multi-engine threat intelligence",
                "Dual-engine encrypted cloud storage: AWS S3 & Cloudinary CDN",
                "Real-time URL phishing and executable payload heuristics",
                "Military-grade AES-256-GCM client-side encryption",
              ]}
              speed={50}
              deleteSpeed={30}
              delay={2500}
            />
          </div>

          <div className="hero-cta-group">
            <button onClick={() => navigate("/register")} className="btn-get-started 3d-btn">
              <span>Launch SafeNet Free</span>
              <ArrowRightIcon size={16} />
            </button>
            <button onClick={() => navigate("/scanner")} className="btn-secondary-cta">
              <ZapIcon size={16} />
              <span>Live Threat Scan</span>
            </button>
          </div>

          {/* Quick Telemetry Ticker */}
          <div className="hero-telemetry-bar">
            <div className="telemetry-item">
              <span className="telemetry-label">THREATS NEUTRALIZED</span>
              <span className="telemetry-value text-red">{blockedThreats.toLocaleString()}</span>
            </div>
            <div className="telemetry-divider"></div>
            <div className="telemetry-item">
              <span className="telemetry-label">SCANNED ASSETS</span>
              <span className="telemetry-value text-cyan">{scannedFiles.toLocaleString()}</span>
            </div>
            <div className="telemetry-divider"></div>
            <div className="telemetry-item">
              <span className="telemetry-label">DETECTION ACCURACY</span>
              <span className="telemetry-value text-green">99.98%</span>
            </div>
          </div>
        </div>

        {/* 3D Holographic Cyber Security Shield Stage */}
        <div className="hero-image">
          <div className="cyber-3d-stage">
            <div className="hologram-grid-plane"></div>
            <div className="radar-sweep-beam"></div>

            {/* 3D Core Shield */}
            <div className="shield-3d-container">
              <div className="shield-core">
                <span className="shield-symbol">
                  <ShieldCheckIcon size={44} color="#06b6d4" />
                </span>
                <div className="core-glow"></div>
              </div>

              {/* Orbital 3D Tech Rings */}
              <div className="orbital-ring ring-x"></div>
              <div className="orbital-ring ring-y"></div>
              <div className="orbital-ring ring-z"></div>

              {/* Floating Security Nodes */}
              <div className="floating-node node-1">
                <span><LockIcon size={13} /> AES-256</span>
              </div>
              <div className="floating-node node-2">
                <span><ZapIcon size={13} /> Cloudinary</span>
              </div>
              <div className="floating-node node-3">
                <span><CloudIcon size={13} /> AWS S3</span>
              </div>
              <div className="floating-node node-4">
                <span><CpuIcon size={13} /> Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Matrix (3D Tilt Cards) */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Multi-Layered Security Infrastructure</h2>
          <p className="section-subtitle">Engineered for developers, security analysts, and teams requiring zero compromise on privacy.</p>
        </div>

        <div className="features-grid">
          <TiltCard className="feature-tilt-wrapper">
            <div className="feature-card-content" onClick={() => navigate("/scanner")}>
              <div className="feature-icon-badge cyan-glow">
                <SearchIcon size={24} color="#06b6d4" />
              </div>
              <h3 className="feature-title">Multi-Engine Malware Scanner</h3>
              <p className="feature-description">
                Simultaneously scan files and URLs against 70+ industry-leading security engines with instant plain-English threat summaries and safety conclusions.
              </p>
              <div className="feature-action-link">
                <span>Open Scanner</span> &rarr;
              </div>
            </div>
          </TiltCard>

          <TiltCard className="feature-tilt-wrapper">
            <div className="feature-card-content" onClick={() => navigate("/upload")}>
              <div className="feature-icon-badge purple-glow">
                <LockIcon size={24} color="#a855f7" />
              </div>
              <h3 className="feature-title">Hybrid Encrypted Cloud Vault</h3>
              <p className="feature-description">
                Store files safely with flexible choice: choose between <strong>Cloudinary CDN</strong> or private <strong>AWS S3</strong> with client-side AES-256-GCM encryption.
              </p>
              <div className="feature-action-link">
                <span>Access Vault</span> &rarr;
              </div>
            </div>
          </TiltCard>

          <TiltCard className="feature-tilt-wrapper">
            <div className="feature-card-content" onClick={() => navigate("/chatbot")}>
              <div className="feature-icon-badge emerald-glow">
                <BotIcon size={24} color="#10b981" />
              </div>
              <h3 className="feature-title">AI Threat Intelligence Sentinel</h3>
              <p className="feature-description">
                Receive automated Executive threat assessments, attack vector breakdowns, behavioral IOC analysis, and interactive incident response playbooks.
              </p>
              <div className="feature-action-link">
                <span>Chat with Sentinel</span> &rarr;
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* Security Architecture Highlights */}
      <section className="architecture-section">
        <div className="arch-card">
          <div className="arch-header">
            <span className="arch-tag">ARCHITECTURE</span>
            <h3>Enterprise Privacy &amp; Threat Defense Standards</h3>
          </div>
          <div className="arch-badges-list">
            <div className="arch-badge">
              <span className="badge-icon">
                <ShieldCheckIcon size={22} color="#06b6d4" />
              </span>
              <div>
                <strong>Zero-Knowledge Architecture</strong>
                <p>Decryption keys remain strictly with the user; ciphertexts are indecipherable on cloud storage.</p>
              </div>
            </div>
            <div className="arch-badge">
              <span className="badge-icon">
                <ZapIcon size={22} color="#f59e0b" />
              </span>
              <div>
                <strong>Adaptive Rate Limiting &amp; Defense</strong>
                <p>Protected against brute force attacks, credential stuffing, clickjacking, and web exploits.</p>
              </div>
            </div>
            <div className="arch-badge">
              <span className="badge-icon">
                <ChartIcon size={22} color="#818cf8" />
              </span>
              <div>
                <strong>Shannon Entropy Analysis</strong>
                <p>Detects hidden packers, obfuscated scripts, and weaponized payloads before execution.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <ShieldCheckIcon size={20} color="#22d3ee" />
              <span>Safe<span className="gradient-text">Net</span></span>
            </div>
            <p className="footer-tagline">
              Enterprise-grade malware scanning, hybrid encrypted cloud vault, and AI threat intelligence.
            </p>
            <p className="footer-copyright">© {new Date().getFullYear()} SafeNet Security Platform.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Security Tools</h4>
              <button onClick={() => navigate("/scanner")} className="footer-link-btn">Threat Scanner</button>
              <button onClick={() => navigate("/upload")} className="footer-link-btn">Encrypted Cloud Vault</button>
              <button onClick={() => navigate("/chatbot")} className="footer-link-btn">AI Security Sentinel</button>
            </div>
            <div className="footer-column">
              <h4>Account</h4>
              <button onClick={() => navigate("/login")} className="footer-link-btn">Sign In</button>
              <button onClick={() => navigate("/register")} className="footer-link-btn">Register</button>
              <button onClick={() => navigate("/home")} className="footer-link-btn">Dashboard</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainHome;
