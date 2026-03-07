"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api("/ai/chat", {
        method: "POST",
        token,
        body: {
          message: userMsg.content,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });
      const reply =
        typeof res.data?.response === "string"
          ? res.data.response
          : res.data?.response?.message ||
            JSON.stringify(res.data?.response || "No response.");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      const errMsg =
        typeof err?.message === "string" ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errMsg}` },
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
    } catch (err: any) {
      const errMsg =
        typeof err?.message === "string" ? err.message : "Something went wrong";
      setAnalysis(`Error: ${errMsg}`);
    } finally {
      setAnalyzing(false);
    }
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
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Bot size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Financial Chat
            </span>
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
                  <p className="whitespace-pre-wrap">{msg.content}</p>
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
                placeholder="Ask about your finances..."
                className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
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
              <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </div>
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
