"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/Components/AuthProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tools_used?: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const RAG_URL =
  process.env.NEXT_PUBLIC_RAG_URL || "http://localhost:8000";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// ─── Thinking Dots Animation ─────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="fab-thinking">
      <span />
      <span />
      <span />
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`fab-msg-row ${isUser ? "fab-msg-user" : "fab-msg-ai"}`}>
      {!isUser && (
        <div className="fab-avatar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <div className={`fab-bubble ${isUser ? "fab-bubble-user" : "fab-bubble-ai"}`}>
        <div className="fab-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div>
        {msg.tools_used && msg.tools_used.length > 0 && (
          <div className="fab-tools">
            {msg.tools_used.map((t) => (
              <span key={t} className="fab-tool-tag">
                ⚡ {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main FAB Component ───────────────────────────────────────────────────────
export default function FloatingChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Finora AI 👋 Ask me anything about your finances, transactions, or uploaded documents.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `fab-${generateId()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !user) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${RAG_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          message: trimmed,
          session_id: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        tools_used: data.tools_used || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            "Sorry, I couldn't reach the AI service right now. Please try again shortly.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, user, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    try {
      await fetch(`${RAG_URL}/chat/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch {
      // ignore errors on clearing
    }
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Chat cleared. How can I help you with your finances?",
        timestamp: new Date(),
      },
    ]);
  };

  if (!user) return null;

  return (
    <>
      <style>{FAB_STYLES}</style>

      {/* Chat Panel */}
      <div className={`fab-panel ${open ? "fab-panel-open" : ""}`}>
        {/* Header */}
        <div className="fab-header">
          <div className="fab-header-left">
            <div className="fab-header-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="fab-header-title">Finora AI</p>
              <p className="fab-header-sub">
                <span className="fab-status-dot" /> Online
              </p>
            </div>
          </div>
          <div className="fab-header-actions">
            <button onClick={clearChat} className="fab-icon-btn" title="Clear chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button onClick={() => setOpen(false)} className="fab-icon-btn" title="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="fab-messages">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {loading && (
            <div className="fab-msg-row fab-msg-ai">
              <div className="fab-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="fab-bubble fab-bubble-ai">
                <ThinkingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="fab-input-area">
          <div className="fab-input-row">
            <textarea
              ref={inputRef}
              className="fab-textarea"
              placeholder="Ask about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="fab-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="fab-footer-note">Powered by Finora RAG · Enter to send</p>
        </div>
      </div>

      {/* FAB Trigger Button */}
      <button
        className={`fab-trigger ${open ? "fab-trigger-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Chat"
      >
        <span className="fab-trigger-inner">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        {!open && <span className="fab-ripple" />}
      </button>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const FAB_STYLES = `
  /* ── FAB Trigger ─────────────────────────────────────────── */
  .fab-trigger {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.45), 0 2px 8px rgba(0,0,0,0.3);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .fab-trigger:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.6), 0 2px 8px rgba(0,0,0,0.3);
  }
  .fab-trigger-open {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }
  .fab-trigger-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  }
  .fab-ripple {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    animation: fabRipple 2s ease-out infinite;
  }
  @keyframes fabRipple {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  /* ── Panel ───────────────────────────────────────────────── */
  .fab-panel {
    position: fixed;
    bottom: 96px;
    right: 28px;
    z-index: 9998;
    width: 360px;
    max-width: calc(100vw - 32px);
    height: 520px;
    max-height: calc(100vh - 120px);
    background: #0f0f13;
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    transform: scale(0.85) translateY(20px);
    transform-origin: bottom right;
    opacity: 0;
    pointer-events: none;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
  }
  .fab-panel-open {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  /* ── Header ──────────────────────────────────────────────── */
  .fab-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .fab-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .fab-header-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .fab-header-title {
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  }
  .fab-header-sub {
    font-size: 11px;
    color: #64748b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  }
  .fab-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    display: inline-block;
    animation: fabPulse 2s ease-in-out infinite;
  }
  @keyframes fabPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .fab-header-actions {
    display: flex;
    gap: 4px;
  }
  .fab-icon-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .fab-icon-btn:hover {
    background: rgba(255,255,255,0.1);
    color: #f1f5f9;
  }

  /* ── Messages ─────────────────────────────────────────────── */
  .fab-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }
  .fab-messages::-webkit-scrollbar { width: 4px; }
  .fab-messages::-webkit-scrollbar-track { background: transparent; }
  .fab-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

  .fab-msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    animation: fabMsgIn 0.25s ease;
  }
  @keyframes fabMsgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fab-msg-user { flex-direction: row-reverse; }

  .fab-avatar {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .fab-bubble {
    max-width: 78%;
    padding: 10px 13px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 1.55;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  }
  .fab-bubble-ai {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    color: #e2e8f0;
    border-bottom-left-radius: 4px;
  }
  .fab-bubble-user {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 16px rgba(99,102,241,0.3);
  }
  .fab-bubble-text {
    margin: 0;
    word-break: break-word;
  }
  .fab-markdown {
    font-size: 13px;
    line-height: 1.6;
    letter-spacing: 0.01em;
  }
  .fab-markdown p { margin: 0 0 8px 0; }
  .fab-markdown p:last-child { margin-bottom: 0; }
  .fab-markdown ul, .fab-markdown ol { 
    margin: 8px 0; 
    padding-left: 20px; 
  }
  .fab-markdown li { margin-bottom: 4px; }
  .fab-markdown code {
    background: rgba(255,255,255,0.1);
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 11px;
  }
  .fab-markdown pre {
    background: rgba(0,0,0,0.3);
    padding: 12px;
    border-radius: 12px;
    margin: 10px 0;
    overflow-x: auto;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .fab-markdown pre code { background: none; padding: 0; }
  .fab-markdown strong { color: #fff; font-weight: 600; }
  .fab-markdown a { color: #818cf8; text-decoration: underline; }
  .fab-markdown table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 11px;
  }
  .fab-markdown th, .fab-markdown td {
    border: 1px solid rgba(255,255,255,0.1);
    padding: 6px 8px;
    text-align: left;
  }
  .fab-markdown th { background: rgba(255,255,255,0.05); }
  .fab-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 7px;
  }
  .fab-tool-tag {
    font-size: 10px;
    padding: 2px 7px;
    background: rgba(99,102,241,0.25);
    border: 1px solid rgba(99,102,241,0.4);
    border-radius: 20px;
    color: #a5b4fc;
  }

  /* ── Thinking Dots ────────────────────────────────────────── */
  .fab-thinking {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 2px 0;
  }
  .fab-thinking span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6366f1;
    animation: fabDot 1.2s ease-in-out infinite;
  }
  .fab-thinking span:nth-child(2) { animation-delay: 0.2s; }
  .fab-thinking span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes fabDot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Input Area ───────────────────────────────────────────── */
  .fab-input-area {
    padding: 12px 14px 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
    background: #0f0f13;
  }
  .fab-input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 14px;
    padding: 8px 10px;
    transition: border-color 0.2s;
  }
  .fab-input-row:focus-within {
    border-color: rgba(99,102,241,0.5);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .fab-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    resize: none;
    max-height: 100px;
    line-height: 1.5;
  }
  .fab-textarea::placeholder { color: #475569; }
  .fab-send-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 10px;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    flex-shrink: 0;
    transition: transform 0.15s, opacity 0.15s;
  }
  .fab-send-btn:hover:not(:disabled) { transform: scale(1.08); }
  .fab-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .fab-footer-note {
    font-size: 10px;
    color: #334155;
    margin: 7px 0 0;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  }

  /* ── Mobile ───────────────────────────────────────────────── */
  @media (max-width: 480px) {
    .fab-panel {
      right: 12px;
      bottom: 84px;
      width: calc(100vw - 24px);
    }
    .fab-trigger {
      right: 16px;
      bottom: 20px;
    }
  }
`;
