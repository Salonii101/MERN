import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Layout from "./Layout";
import {
  ShieldCheckIcon,
  UserIcon,
  SendIcon,
  TrashIcon,
  LockIcon,
  ChartIcon,
  AlertTriangleIcon,
  SearchIcon,
  CpuIcon,
  SparklesIcon,
  BotIcon
} from "./Icons";
import "./Chatbot.css";

const QUICK_PROMPTS = [
  { Icon: LockIcon, label: "AES-256-GCM Explained", prompt: "Explain how AES-256-GCM authenticated encryption works." },
  { Icon: ChartIcon, label: "Shannon Entropy & Malware", prompt: "What is Shannon Entropy and how does it detect obfuscated malware?" },
  { Icon: AlertTriangleIcon, label: "Ransomware Playbook", prompt: "Give me a step-by-step incident response playbook for ransomware." },
  { Icon: SearchIcon, label: "Multi-Engine Inspection", prompt: "How does multi-engine antivirus telemetry aggregate 70+ vendor detection signatures?" },
];

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: `<div class="ai-welcome"><strong>SafeNet Sentinel Copilot is online.</strong><br/>I am your AI Cybersecurity Analyst &mdash; powered by Gemini 3.6 Flash. Ask me anything about threat intelligence, cryptographic protocols, CVEs, malware evasion, or incident response.</div>`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendPrompt = async (promptText) => {
    if (!promptText.trim() || loading) return;

    const userMessage = promptText.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot", { message: userMessage });
      const aiReply = res.data?.reply || "<p>No response received from AI Sentinel.</p>";
      setMessages((prev) => [...prev, { sender: "bot", text: aiReply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "<p>Sentinel service unavailable. Please check backend connection or verify GEMINI_API_KEY.</p>" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        text: `<p>Session cleared. Ready for your next security inquiry.</p>`,
      },
    ]);
  };

  return (
    <Layout>
      <div className="chatbot-page">
        {/* Header */}
        <div className="chatbot-header-bar">
          <div className="chatbot-header-left">
            <span className="sentinel-tag">
              <SparklesIcon size={13} color="#22d3ee" />
              <span>AI THREAT COPILOT</span>
            </span>
            <h1 className="chatbot-title">
              SafeNet <span className="gradient-text">Sentinel</span>
            </h1>
            <p className="chatbot-sub">
              Powered by Gemini 3.6 Flash &bull; Autonomous threat auditing &amp; mitigation intelligence
            </p>
          </div>
          <button onClick={clearChat} className="clear-chat-btn" title="Clear conversation">
            <TrashIcon size={15} />
            <span>Clear Session</span>
          </button>
        </div>

        <div className="chatbot-container">
          {/* Quick Prompt Chips */}
          <div className="quick-prompts-row">
            {QUICK_PROMPTS.map(({ Icon, label, prompt }) => (
              <button key={label} onClick={() => sendPrompt(prompt)} className="quick-prompt-chip">
                <span className="chip-icon"><Icon size={14} /></span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                <div className="msg-avatar">
                  {msg.sender === "user" ? (
                    <UserIcon size={18} color="#818cf8" />
                  ) : (
                    <ShieldCheckIcon size={18} color="#22d3ee" />
                  )}
                </div>
                <div className="msg-body" dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
            ))}

            {loading && (
              <div className="message-bubble bot-bubble">
                <div className="msg-avatar">
                  <BotIcon size={18} color="#22d3ee" />
                </div>
                <div className="msg-body loading-indicator">
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-label">Evaluating threat vectors...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask about CVEs, cryptographic protocols, incident remediation, phishing..."
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendPrompt(input)}
              disabled={loading}
            />
            <button
              onClick={() => sendPrompt(input)}
              className="chat-send-btn"
              disabled={loading || !input.trim()}
              title="Send message"
            >
              <SendIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Chatbot;
