"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";
import { useTerminalStore, Timeframe } from "@/lib/store/terminalStore";
import { api } from "@/lib/api";

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { selectedSymbol, selectedTimeframe, setTimeframe, currentStockData } =
    useTerminalStore();
  const [loading, setLoading] = useState(true);

  const timeframes: Timeframe[] = [
    "1m",
    "5m",
    "15m",
    "1h",
    "4h",
    "1D",
    "1W",
    "1M",
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize WebGL Chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0d1424" },
        textColor: "#64748b",
        fontFamily: "JetBrains Mono, monospace", // Professional tech look
      },
      grid: {
        vertLines: { color: "#1c2940", style: 1 },
        horzLines: { color: "#1c2940", style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: "#64748b",
          style: 3,
          labelBackgroundColor: "#2962ff",
        },
        horzLine: {
          width: 1,
          color: "#64748b",
          style: 3,
          labelBackgroundColor: "#2962ff",
        },
      },
      rightPriceScale: {
        borderColor: "#1c2940",
        autoScale: true,
      },
      timeScale: {
        borderColor: "#1c2940",
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true, // Responsively match parent flex box
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00ff88",
      downColor: "#ff3b3b",
      borderVisible: false,
      wickUpColor: "#00ff88",
      wickDownColor: "#ff3b3b",
    });

    const predictionLineSeries = chart.addSeries(LineSeries, {
      color: "#2962ff",
      lineWidth: 2,
      lineStyle: 2, // Dashed line for future projection
      crosshairMarkerVisible: true,
      lastValueVisible: true,
    });

    // 1. Fetch History
    let isMounted = true;

    const loadChartData = async () => {
      setLoading(true);
      try {
        // Fetch OHLCV History
        const histRes = await api(
          `/stocks/history?symbol=${selectedSymbol}&timeframe=${selectedTimeframe}`,
        );

        if (isMounted && histRes.data) {
          candlestickSeries.setData(histRes.data);

          // Fetch prediction projection using the last known close price
          const lastCandle = histRes.data[histRes.data.length - 1];
          const predRes = await api("/stocks/predict", {
            method: "POST",
            body: {
              symbol: selectedSymbol,
              currentPrice: lastCandle.close,
              timeframe: selectedTimeframe,
            },
          });

          if (isMounted && predRes.data?.curve) {
            // Plot AI prediction
            predictionLineSeries.setData(predRes.data.curve);

            // Fit bounds to show history + future projection
            chart.timeScale().fitContent();
          }
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadChartData();

    return () => {
      isMounted = false;
      chart.remove(); // Cleanup resize observers and canvas contexts
    };
  }, [selectedSymbol, selectedTimeframe]);

  return (
    <div className="relative w-full h-full flex flex-col pt-1">
      {/* Chart Toolbar Overlay */}
      <div
        className="absolute top-2 left-4 z-10 flex items-center justify-between pointer-events-none"
        style={{ width: "calc(100% - 60px)" }}
      >
        <div className="flex items-center gap-4 pointer-events-auto bg-[#0a0f1c]/80 backdrop-blur border border-[#1c2940] rounded flex-wrap">
          <div className="px-3 py-1 font-bold font-mono border-r border-[#1c2940]">
            {currentStockData?.symbol || selectedSymbol}
          </div>
          <div className="flex rounded divide-x divide-[#1c2940]">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 text-xs font-mono transition-colors hover:text-white ${selectedTimeframe === tf ? "text-white bg-[#2962ff]/20" : "text-white/50"}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
            Syncing Oracle Node
          </div>
        </div>
      )}

      {/* Root node for TradingView WebGL injection */}
      <div ref={chartContainerRef} className="w-full h-full flex-1 min-h-0" />
    </div>
  );
}
