import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import ParticleBackground from "./components/ParticleBackground";
import TiltCard from "./components/TiltCard";
import api from "./api";
import {
  ShieldIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  SearchIcon,
  CloudIcon,
  BotIcon,
  LockIcon,
  ZapIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ArrowRightIcon
} from "./components/Icons";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [filesCount, setFilesCount] = useState(0);
  const [threatsDetected, setThreatsDetected] = useState(3);
  const [filesScanned, setFilesScanned] = useState(128);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verify User Session
    api
      .get("/auth/me")
      .then((result) => {
        if (result.data?.success && result.data?.user) {
          setUser(result.data.user);
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      })
      .finally(() => setLoading(false));

    // 2. Fetch User Vault Files Count
    api
      .get("/files/my-files")
      .then((res) => {
        if (res.data?.files) {
          setFilesCount(res.data.files.length);
        }
      })
      .catch(() => {});
  }, [navigate]);

  return (
    <Layout>
      <ParticleBackground />
      <div className="home-dashboard">
        {/* Command Center Header */}
        <div className="command-header">
          <div className="welcome-banner">
            <div className="status-live-pill">
              <span className="live-dot"></span>
              <span>ZERO-TRUST WATCHDOG ACTIVE</span>
            </div>
            <h1 className="welcome-title">
              Security Hub // <span className="gradient-text">{user?.name || "Cyber Analyst"}</span>
            </h1>
            <p className="welcome-subtitle">
              Encrypted Hybrid Vault &amp; AI Threat Intelligence Operations Active.
            </p>
          </div>

          <div className="quick-stats-row">
            <div className="header-stat-badge">
              <span className="h-stat-icon">
                <ShieldCheckIcon size={22} color="#06b6d4" />
              </span>
              <div>
                <div className="h-stat-num text-cyan">{filesScanned}</div>
                <div className="h-stat-label">Scans Completed</div>
              </div>
            </div>
            <div className="header-stat-badge">
              <span className="h-stat-icon">
                <LockIcon size={22} color="#818cf8" />
              </span>
              <div>
                <div className="h-stat-num text-purple">{filesCount}</div>
                <div className="h-stat-label">Vault Files (AES-256)</div>
              </div>
            </div>
            <div className="header-stat-badge">
              <span className="h-stat-icon">
                <ShieldAlertIcon size={22} color="#f43f5e" />
              </span>
              <div>
                <div className="h-stat-num text-red">{threatsDetected}</div>
                <div className="h-stat-label">Threats Quarantined</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Action Command Cards */}
        <div className="dashboard-cards-grid">
          <TiltCard className="cmd-tilt-card">
            <div className="cmd-card" onClick={() => navigate("/scanner")}>
              <div className="cmd-card-header">
                <div className="cmd-icon-box cyan-bg">
                  <SearchIcon size={24} color="#06b6d4" />
                </div>
                <span className="cmd-tag">MULTI-ENGINE</span>
              </div>
              <h3 className="cmd-title">Smart Malware &amp; URL Scanner</h3>
              <p className="cmd-desc">
                Analyze files, documents, and web links across 70+ security engines with plain-English AI threat conclusions.
              </p>
              <div className="cmd-footer">
                <button className="cmd-action-btn cyan-btn">
                  <span>Start Inspection</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="cmd-tilt-card">
            <div className="cmd-card" onClick={() => navigate("/upload")}>
              <div className="cmd-card-header">
                <div className="cmd-icon-box purple-bg">
                  <CloudIcon size={24} color="#a855f7" />
                </div>
                <span className="cmd-tag">HYBRID VAULT</span>
              </div>
              <h3 className="cmd-title">Encrypted Cloud Vault</h3>
              <p className="cmd-desc">
                Upload and manage files with dual storage routing (<strong>Cloudinary CDN</strong> or <strong>AWS S3</strong>) fortified with AES-256-GCM encryption.
              </p>
              <div className="cmd-footer">
                <button className="cmd-action-btn purple-btn">
                  <span>Manage Vault ({filesCount})</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="cmd-tilt-card">
            <div className="cmd-card" onClick={() => navigate("/chatbot")}>
              <div className="cmd-card-header">
                <div className="cmd-icon-box emerald-bg">
                  <BotIcon size={24} color="#10b981" />
                </div>
                <span className="cmd-tag">AI SENTINEL</span>
              </div>
              <h3 className="cmd-title">AI Sentinel Assistant</h3>
              <p className="cmd-desc">
                Consult the intelligent cybersecurity copilot for instant code audits, phishing analysis, CVE threat intel, and incident playbooks.
              </p>
              <div className="cmd-footer">
                <button className="cmd-action-btn emerald-btn">
                  <span>Consult Sentinel</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Live Security Feed & Architecture Insights */}
        <div className="security-feed-section">
          <div className="feed-card">
            <div className="feed-header">
              <h3>Security Telemetry Stream</h3>
              <span className="feed-live-badge">REAL-TIME</span>
            </div>
            <div className="telemetry-log-list">
              <div className="telemetry-log-item clean">
                <span className="log-icon">
                  <CheckCircleIcon size={18} color="#10b981" />
                </span>
                <div className="log-details">
                  <strong>Clean File Inspected (SHA-256: 8f41...29d)</strong>
                  <span>0/72 Antivirus Engines detected threats &bull; Safe to run</span>
                </div>
                <span className="log-time">2 mins ago</span>
              </div>
              <div className="telemetry-log-item encrypted">
                <span className="log-icon">
                  <LockIcon size={18} color="#818cf8" />
                </span>
                <div className="log-details">
                  <strong>Vault File Stored via Cloudinary CDN</strong>
                  <span>AES-256-GCM combined payload generated &bull; Stored with AuthTag</span>
                </div>
                <span className="log-time">14 mins ago</span>
              </div>
              <div className="telemetry-log-item threat">
                <span className="log-icon">
                  <AlertTriangleIcon size={18} color="#f43f5e" />
                </span>
                <div className="log-details">
                  <strong>Malicious URL Blocked (phishing-portal.xyz)</strong>
                  <span>14 engines flagged domain as Credential Harvester</span>
                </div>
                <span className="log-time">1 hr ago</span>
              </div>
            </div>
          </div>

          <div className="feed-card quick-guide-card">
            <div className="feed-header">
              <h3>Storage Provider Routing</h3>
              <span className="feed-tag">HYBRID READY</span>
            </div>
            <div className="guide-content">
              <div className="provider-status-row">
                <div className="provider-info">
                  <span className="provider-icon">
                    <ZapIcon size={20} color="#06b6d4" />
                  </span>
                  <div>
                    <strong>Cloudinary Fast CDN</strong>
                    <p>Default storage for fast encrypted uploads and global CDN delivery.</p>
                  </div>
                </div>
                <span className="provider-active-pill">ACTIVE</span>
              </div>
              <div className="provider-status-row">
                <div className="provider-info">
                  <span className="provider-icon">
                    <CloudIcon size={20} color="#a855f7" />
                  </span>
                  <div>
                    <strong>AWS S3 Private Bucket</strong>
                    <p>Dedicated encrypted bucket storage with presigned temporary download links.</p>
                  </div>
                </div>
                <span className="provider-active-pill">AVAILABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
