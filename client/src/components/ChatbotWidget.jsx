import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import {
  BotIcon,
  SendIcon,
  LockIcon,
  ChartIcon,
  AlertTriangleIcon,
  ShieldCheckIcon
} from "./Icons";
import "./ChatbotWidget.css";

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendPrompt = async (promptText) => {
    if (!promptText.trim() || isLoading) return;

    const userMessage = promptText.trim();
    const newMessage = { sender: "user", text: userMessage };

    setInput("");
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const res = await api.post("/chatbot", {
        message: userMessage,
      });

      if (res.data?.success && res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: res.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "<p>No response received from AI Sentinel.</p>" },
        ]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "<p>Sentinel offline or rate limit reached. Please try again.</p>",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        className={`chatbot-float-btn ${isOpen ? "active" : ""}`}
        onClick={toggleChatbot}
        aria-label="Toggle AI Sentinel"
      >
        {isOpen ? <span>✕</span> : <BotIcon size={24} color="#ffffff" />}
      </button>

      {/* Chatbot Side Panel */}
      <div className={`chatbot-panel ${isOpen ? "open" : ""}`}>
        <div className="chatbot-panel-header">
          <div className="panel-header-info">
            <span className="panel-dot"></span>
            <div>
              <h3>AI Sentinel Copilot</h3>
              <small>Gemini 3.6 &bull; Cyber Threat Intel</small>
            </div>
          </div>
          <button className="close-panel-btn" onClick={toggleChatbot} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="chatbot-panel-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <span className="welcome-icon">
                <ShieldCheckIcon size={28} color="#22d3ee" />
              </span>
              <h4>SafeNet Cyber Sentinel</h4>
              <p>Ask about threat analysis, CVEs, AES encryption, or incident playbooks.</p>

              <div className="widget-suggestion-chips">
                <button onClick={() => sendPrompt("How does AES-256-GCM protect files?")}>
                  <LockIcon size={14} />
                  <span>AES-256-GCM Security</span>
                </button>
                <button onClick={() => sendPrompt("What does Shannon Entropy indicate in malware detection?")}>
                  <ChartIcon size={14} />
                  <span>Explain Shannon Entropy</span>
                </button>
                <button onClick={() => sendPrompt("Give me a fast incident response playbook for ransomware.")}>
                  <AlertTriangleIcon size={14} />
                  <span>Ransomware Response</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`panel-message-bubble ${
                    msg.sender === "user" ? "user-bubble" : "bot-bubble"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              ))}
              {isLoading && (
                <div className="panel-message-bubble bot-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chatbot-panel-input">
          <input
            type="text"
            placeholder="Ask AI Sentinel..."
            className="panel-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && sendPrompt(input)}
            disabled={isLoading}
          />
          <button
            onClick={() => sendPrompt(input)}
            className="panel-send-btn"
            disabled={isLoading || !input.trim()}
            aria-label="Send"
          >
            {isLoading ? (
              <span className="sending-dots"><span /><span /><span /></span>
            ) : (
              <SendIcon size={15} color="#ffffff" />
            )}
          </button>
        </div>
      </div>

      {/* Overlay when panel is open */}
      {isOpen && <div className="chatbot-overlay" onClick={toggleChatbot}></div>}
    </>
  );
}

export default ChatbotWidget;
