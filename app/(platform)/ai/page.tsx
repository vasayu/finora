"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { Send, Bot, User, Sparkles, CheckCircle2, XCircle, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { VisualMarkdown } from "@/Components/VisualMarkdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Typed interrupt state the backend sends when graph is paused */
interface HitlState {
  interruptType: "large_transaction" | "categorize_transaction";
  options: string[];        // [] for yes/no, populated for category
  metadata: Record<string, unknown>;
}

export default function AIPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem("finora_chat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hitl, setHitl] = useState<HitlState | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem("finora_chat_history", JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /** Send a chat message */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      if (!window.sessionStorage.getItem("rag_session_id")) {
        window.sessionStorage.setItem("rag_session_id", crypto.randomUUID());
      }
      const sessionId = window.sessionStorage.getItem("rag_session_id");

      const data = await api("/rag/chat", {
        method: "POST",
        token,
        body: { message: userMsg.content, session_id: sessionId },
      });

      // Check for HITL interrupt
      if (data?.status === "requires_approval") {
        setHitl({
          interruptType: data.interrupt_type ?? "large_transaction",
          options: data.options ?? [],
          metadata: data.metadata ?? {},
        });
      } else {
        setHitl(null);
      }

      const reply =
        typeof data?.answer === "string"
          ? data.answer
          : typeof data?.message === "string"
          ? data.message
          : JSON.stringify(data || "No response.");

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      const displayMsg =
        errMsg.toLowerCase().includes("token") ||
        errMsg.toLowerCase().includes("authorized")
          ? "Session expired — please log out and log in again."
          : `Error: ${errMsg}`;
      setMessages((prev) => [...prev, { role: "assistant", content: displayMsg }]);
    } finally {
      setSending(false);
    }
  };

  /**
   * Resume the graph with the human's choice.
   * For large_transaction: choice = 'yes' | 'no'
   * For categorize_transaction: choice = category name string
   */
  const submitChoice = async (choice: string) => {
    if (!hitl) return;
    const prevHitl = hitl;
    setHitl(null);
    setSending(true);

    try {
      const sessionId = window.sessionStorage.getItem("rag_session_id");
      const res = await api("/rag/hitl/resume", {
        method: "POST",
        token,
        body: {
          session_id: sessionId,
          choice,
          interrupt_type: prevHitl.interruptType,
        },
      });

      const reply =
        typeof res?.answer === "string"
          ? res.answer
          : typeof res?.message === "string"
          ? res.message
          : JSON.stringify(res || "No response.");

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error resuming: ${errMsg}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await api("/ai/analyze", {
        method: "POST",
        token,
        body: { query: "Provide a comprehensive financial analysis." },
      });
      const result =
        typeof res.data?.analysis === "string"
          ? res.data.analysis
          : res.data?.analysis?.analysis ||
            JSON.stringify(res.data?.analysis || "No analysis generated.");
      setAnalysis(result);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setAnalysis(`Error: ${errMsg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Inline HITL button panel ─────────────────────────────────
  const renderHitlButtons = () => {
    if (!hitl) return null;

    if (hitl.interruptType === "large_transaction") {
      const amount = hitl.metadata?.amount as number | undefined;
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mt-4 pt-3 border-t border-white/10"
        >
          {amount && (
            <p className="text-xs text-amber-400/80 font-mono mb-3">
              ⚠️ Transaction amount:{" "}
              <span className="font-bold text-amber-400">
                ₹{amount.toLocaleString("en-IN")}
              </span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              id="hitl-approve-btn"
              onClick={() => submitChoice("yes")}
              disabled={sending}
              className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                         bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40
                         hover:border-emerald-500/70 text-emerald-400 rounded-xl text-sm
                         font-semibold transition-all duration-200 disabled:opacity-40"
            >
              <CheckCircle2 size={15} className="group-hover:scale-110 transition-transform" />
              Yes, Proceed
            </button>
            <button
              id="hitl-reject-btn"
              onClick={() => submitChoice("no")}
              disabled={sending}
              className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                         bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40
                         hover:border-rose-500/70 text-rose-400 rounded-xl text-sm
                         font-semibold transition-all duration-200 disabled:opacity-40"
            >
              <XCircle size={15} className="group-hover:scale-110 transition-transform" />
              No, Cancel
            </button>
          </div>
        </motion.div>
      );
    }

    if (hitl.interruptType === "categorize_transaction") {
      const categories =
        hitl.options.length > 0
          ? hitl.options
          : [
              "Food & Dining",
              "Transport",
              "Shopping",
              "Healthcare",
              "Utilities",
              "Entertainment",
              "Salary / Income",
              "Investments",
              "Rent / Housing",
              "Other",
            ];

      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="mt-4 pt-3 border-t border-white/10"
        >
          <div className="flex items-center gap-1.5 mb-3 text-xs text-blue-400/80 font-mono">
            <Tag size={12} />
            <span>Pick a category to continue:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`hitl-cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => submitChoice(cat)}
                disabled={sending}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border
                           bg-[#1c2940]/60 hover:bg-blue-500/20 border-[#2a3a5e]
                           hover:border-blue-500/60 text-white/70 hover:text-blue-300
                           transition-all duration-150 disabled:opacity-40"
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-foreground/50 text-sm mt-1">
          OpenAI-powered financial intelligence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/[0.06] rounded-2xl h-[600px] flex flex-col">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Financial Chat
              </span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  setMessages([]);
                  setHitl(null);
                  localStorage.removeItem("finora_chat_history");
                  sessionStorage.removeItem("rag_session_id");
                }}
                className="text-xs text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                Clear chat
              </button>
            )}
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Bot size={48} className="text-foreground/10 mx-auto mb-3" />
                  <p className="text-foreground/40 text-sm">
                    Ask me anything about your finances
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white/[0.04] text-foreground border border-white/[0.06] rounded-bl-md"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:whitespace-pre-wrap prose-a:text-primary hover:prose-a:text-orange-400 prose-ul:list-disc prose-ul:ml-4 prose-th:text-left prose-td:border-t prose-td:border-white/10 prose-th:p-2 prose-td:p-2 prose-table:border prose-table:border-white/10 prose-table:rounded-lg">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>

                      {/* HITL buttons — rendered inside the LAST assistant message */}
                      <AnimatePresence>
                        {hitl && i === messages.length - 1 && renderHitlButtons()}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                    <User size={14} className="text-foreground/50" />
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-white/[0.04] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="px-4 py-3 border-t border-white/[0.06]"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!!hitl || sending}
                placeholder={
                  hitl
                    ? hitl.interruptType === "large_transaction"
                      ? "Please approve or reject the transaction above…"
                      : "Please select a category above…"
                    : "Ask about your finances..."
                }
                className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={sending || !!hitl || !input.trim()}
                className="bg-primary hover:bg-orange-600 text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Analysis Panel */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 h-[600px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Financial Analysis
            </span>
          </div>

          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium py-3 rounded-xl transition-all mb-4 disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "Generate Full Analysis"}
          </button>

          <div className="flex-1 overflow-y-auto">
            {analysis ? (
              <VisualMarkdown content={analysis} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-foreground/30 text-sm text-center">
                  Click &quot;Generate&quot; to get AI-powered insights about
                  your financial data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
