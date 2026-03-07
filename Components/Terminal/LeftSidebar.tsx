"use client";

import React, { useState } from "react";
import { useTerminalStore, StockInfo } from "@/lib/store/terminalStore";
import { Search, TrendingUp, TrendingDown, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function LeftSidebar() {
  const {
    watchlist,
    selectedSymbol,
    setSymbol,
    currentStockData,
    updateStockData,
  } = useTerminalStore();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectStock = (stock: StockInfo) => {
    setSymbol(stock.symbol);
    updateStockData(stock);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Top Bar */}
      <div className="p-4 border-b border-[#1c2940]">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            size={16}
          />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0f1c] border border-[#1c2940] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 gap-4">
        <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-2">
          <Star size={14} />
          <span>Watchlist</span>
        </div>

        <div className="flex flex-col gap-2">
          {watchlist
            .filter(
              (s) =>
                s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((stock, idx) => {
              const isSelected = selectedSymbol === stock.symbol;
              const isPositive = stock.changePercent >= 0;

              return (
                <motion.button
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectStock(stock)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left backdrop-blur-md
                                    ${
                                      isSelected
                                        ? "bg-[#2962ff]/20 border-[#2962ff]/50 shadow-[0_0_20px_rgba(41,98,255,0.25)]"
                                        : "bg-[#0a0f1c]/80 border-[#1c2940]/50 hover:bg-[#1c2940]/80 hover:border-[#1c2940]"
                                    }
                                `}
                >
                  <div>
                    <div className="font-bold text-sm text-white font-mono">
                      {stock.symbol}
                    </div>
                    <div className="text-xs text-white/40 truncate max-w-[120px]">
                      {stock.name}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-mono text-sm">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div
                      className={`text-xs font-mono flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {isPositive ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {Math.abs(stock.changePercent).toFixed(2)}%
                    </div>
                  </div>
                </motion.button>
              );
            })}
        </div>
      </div>

      {/* Portfolio Summary Mini-card */}
      <div className="p-4 border-t border-[#1c2940] bg-[#0a0f1c]/50">
        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
          Portfolio Value
        </div>
        <div className="text-xl font-mono font-bold text-white">
          $142,850.20
        </div>
        <div className="text-xs text-emerald-400 font-mono mt-1">
          +1.24% Today
        </div>
      </div>
    </div>
  );
}
