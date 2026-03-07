"use client";

import React, { useEffect, useState } from "react";
import { useTerminalStore } from "@/lib/store/terminalStore";
import {
  Brain,
  Target,
  ShieldAlert,
  Cpu,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export default function RightSidebar() {
  const {
    selectedSymbol,
    currentStockData,
    selectedTimeframe,
    predictionData,
    setPredictionData,
  } = useTerminalStore();
  const [loading, setLoading] = useState(false);

  // Fetch AI prediction when symbol or timeframe changes
  useEffect(() => {
    let isMounted = true;
    const fetchPrediction = async () => {
      if (!currentStockData) return;
      setLoading(true);
      try {
        // In a real app this would call our backend mock endpoint we built
        // We're simulating the network delay here since we don't have auth token easily accessible
        // inside this pure terminal layout right this second without the useAuth wrapper
        // (Assuming terminal is wrapped in AuthProvider at root)
        const res = await api("/stocks/predict", {
          method: "POST",
          body: {
            symbol: selectedSymbol,
            currentPrice: currentStockData.price,
            timeframe: selectedTimeframe,
          },
        });

        if (isMounted && res.data?.prediction) {
          setPredictionData(res.data.prediction);
        }
      } catch (error) {
        console.error("Failed to fetch AI prediction", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPrediction();

    return () => {
      isMounted = false;
    };
  }, [
    selectedSymbol,
    selectedTimeframe,
    currentStockData?.price,
    setPredictionData,
  ]);

  const isBull = predictionData?.trend === "bullish";
  const isBear = predictionData?.trend === "bearish";
  const trendColor = isBull
    ? "text-emerald-400"
    : isBear
      ? "text-rose-400"
      : "text-amber-400";
  const glowColor = isBull
    ? "rgba(16,185,129,0.15)"
    : isBear
      ? "rgba(244,63,94,0.15)"
      : "rgba(251,191,36,0.15)";

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 border-b border-[#1c2940] flex items-center justify-between bg-[#0a0f1c]">
        <div className="flex items-center gap-2">
          <Brain className="text-[#2962ff]" size={18} />
          <span className="font-bold text-sm tracking-wide">
            Prediction Engine
          </span>
        </div>
        <div className="px-2 py-1 rounded bg-[#1c2940] text-xs font-mono text-[#2962ff] border border-[#2962ff]/30">
          LSTM v4.2
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        {/* Main Prediction Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-xl border border-[#1c2940] p-5 bg-[#0a0f1c]/80 backdrop-blur-xl relative overflow-hidden transition-all duration-500"
          style={{
            boxShadow: `0 0 40px ${predictionData ? glowColor : "transparent"}`,
            borderColor: predictionData
              ? trendColor.replace("text-", "border-") + "30"
              : "",
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{
              backgroundColor: predictionData
                ? isBull
                  ? "#34d399"
                  : isBear
                    ? "#fb7185"
                    : "#fbbf24"
                : "#1c2940",
            }}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 opacity-50">
              <Cpu className="text-[#2962ff] animate-pulse" size={32} />
              <span className="text-xs font-mono uppercase tracking-widest text-[#2962ff]">
                Processing Tensor Graph...
              </span>
            </div>
          ) : predictionData ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                  {predictionData.timeframe}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${trendColor} bg-white/5 px-2 py-1 rounded-full border border-current shadow-[0_0_10px_currentColor]`}
                >
                  {predictionData.trend}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-6">
                <span className="text-xs text-white/40">Projected Target</span>
                <div
                  className="text-4xl font-mono font-bold text-white flex items-baseline gap-2"
                  style={{ textShadow: `0 0 20px ${glowColor}` }}
                >
                  ${predictionData.targetPrice.toFixed(2)}
                </div>
              </div>

              {/* Confidence Gauge Component (simplified logic for text) */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1c2940]/50 border border-[#1c2940] backdrop-blur-sm shadow-[inset_0_0_15px_rgba(41,98,255,0.1)]">
                <div className="flex items-center gap-2">
                  <Target size={16} className={trendColor} />
                  <span className="text-sm">Model Confidence</span>
                </div>
                <span
                  className="font-mono text-lg text-white"
                  style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}
                >
                  {predictionData.confidence}%
                </span>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-white/30 text-sm font-mono">
              No analysis data
            </div>
          )}
        </motion.div>

        {/* Explanation Context */}
        {predictionData && !loading && (
          <div className="rounded-xl border border-[#1c2940] p-4 bg-[#0a0f1c]">
            <div className="flex items-center gap-2 mb-3 text-white/50">
              <Activity size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Engine Analysis
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-mono">
              {predictionData.modelExplanation}
            </p>
          </div>
        )}

        {/* Risk Assessment */}
        <div className="rounded-xl border border-[#1c2940] p-4 bg-[#0a0f1c]">
          <div className="flex items-center justify-between mb-3 text-white/50">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Risk Profile
              </span>
            </div>
            <span className="text-amber-400 text-xs font-bold border border-amber-400/30 px-2 py-0.5 rounded">
              MODERATE
            </span>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Volatility Forecast</span>
                <span className="font-mono text-white/80">3.4%</span>
              </div>
              <div className="h-1.5 w-full bg-[#1c2940] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 w-[65%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Upside Probability</span>
                <span className="font-mono text-white/80">
                  {predictionData?.probabilityOfIncrease || 0}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#1c2940] rounded-full overflow-hidden">
                <div
                  className={`h-full w-[${predictionData?.probabilityOfIncrease || 0}%]`}
                  style={{
                    width: `${predictionData?.probabilityOfIncrease || 0}%`,
                    backgroundColor:
                      predictionData?.probabilityOfIncrease &&
                      predictionData.probabilityOfIncrease > 50
                        ? "#34d399"
                        : "#fb7185",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
