"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTerminalStore, WatchlistItem } from "@/lib/store/terminalStore";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  X,
  Building2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  symbol: string;
  name: string;
}

// Mock price data for display (Indian NSE stocks in ₹)
const MOCK_PRICES: Record<string, { price: number; changePercent: number }> = {
  RELIANCE: { price: 2450.75, changePercent: 1.25 },
  TCS: { price: 3852.40, changePercent: -0.45 },
  HDFCBANK: { price: 1623.50, changePercent: 0.88 },
  INFY: { price: 1582.30, changePercent: 2.15 },
  ICICIBANK: { price: 1052.60, changePercent: 1.42 },
  HINDUNILVR: { price: 2518.90, changePercent: -0.32 },
  SBIN: { price: 782.45, changePercent: 1.78 },
  BHARTIARTL: { price: 1148.20, changePercent: 0.55 },
  ITC: { price: 442.80, changePercent: -0.68 },
  KOTAKBANK: { price: 1785.30, changePercent: 0.92 },
  LT: { price: 3425.60, changePercent: 1.15 },
  AXISBANK: { price: 1098.40, changePercent: -1.22 },
  WIPRO: { price: 482.15, changePercent: 0.38 },
  BAJFINANCE: { price: 6812.50, changePercent: 2.44 },
  MARUTI: { price: 10520.00, changePercent: -0.95 },
  HCLTECH: { price: 1455.80, changePercent: 1.67 },
  TATAMOTORS: { price: 722.30, changePercent: 3.12 },
  SUNPHARMA: { price: 1684.40, changePercent: -0.42 },
  TITAN: { price: 3248.70, changePercent: 1.89 },
  ADANIENT: { price: 2905.60, changePercent: -2.10 },
  NTPC: { price: 352.40, changePercent: 0.76 },
  POWERGRID: { price: 292.15, changePercent: 0.22 },
  ULTRACEMCO: { price: 10215.00, changePercent: -0.55 },
  ASIANPAINT: { price: 2855.30, changePercent: 0.64 },
  TATASTEEL: { price: 146.25, changePercent: -1.35 },
  ONGC: { price: 262.80, changePercent: 1.02 },
  TECHM: { price: 1325.40, changePercent: -0.88 },
  JSWSTEEL: { price: 882.50, changePercent: 1.55 },
  INDUSINDBK: { price: 1452.70, changePercent: -0.28 },
  DRREDDY: { price: 5810.20, changePercent: 0.33 },
};

function getMockPrice(symbol: string) {
  return MOCK_PRICES[symbol] || { price: 100 + Math.random() * 200, changePercent: (Math.random() - 0.5) * 5 };
}

export default function LeftSidebar() {
  const {
    watchlist,
    orgWatchlist,
    selectedSymbol,
    setSymbol,
    updateStockData,
    setWatchlist,
    setOrgWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    addToOrgWatchlist,
    removeFromOrgWatchlist,
  } = useTerminalStore();

  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch watchlists on mount
  useEffect(() => {
    const fetchWatchlists = async () => {
      if (!token) return;
      try {
        const res = await api<{ status: string; data: WatchlistItem[] }>(
          "/watchlist",
          { token }
        );
        setWatchlist(res.data);
      } catch (e) {
        console.error("Failed to fetch watchlist", e);
      }

      if (user?.organizationId) {
        try {
          const res = await api<{ status: string; data: WatchlistItem[] }>(
            "/watchlist/org",
            { token }
          );
          setOrgWatchlist(res.data);
        } catch (e) {
          console.error("Failed to fetch org watchlist", e);
        }
      }
    };

    fetchWatchlists();
  }, [token, user?.organizationId, setWatchlist, setOrgWatchlist]);

  // Debounced stock search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const res = await api<{ status: string; data: SearchResult[] }>(
            `/stocks/search?q=${encodeURIComponent(query)}`,
            { token }
          );
          setSearchResults(res.data);
          setShowResults(true);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    [token]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectStock = (symbol: string, name: string) => {
    const mock = getMockPrice(symbol);
    setSymbol(symbol);
    updateStockData({
      symbol,
      name,
      price: mock.price,
      changePercent: mock.changePercent,
      volume: Math.floor(Math.random() * 50000000),
    });
  };

  const handleAddToWatchlist = async (result: SearchResult) => {
    try {
      const res = await api<{ status: string; data: WatchlistItem }>(
        "/watchlist",
        {
          method: "POST",
          token,
          body: { symbol: result.symbol, name: result.name },
        }
      );
      addToWatchlist(res.data);
    } catch (e) {
      console.error("Failed to add to watchlist", e);
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      await api(`/watchlist/${symbol}`, { method: "DELETE", token });
      removeFromWatchlist(symbol);
    } catch (e) {
      console.error("Failed to remove from watchlist", e);
    }
  };

  const handleAddToOrgWatchlist = async (result: SearchResult) => {
    if (!user?.organizationId) return;
    try {
      const res = await api<{ status: string; data: WatchlistItem }>(
        "/watchlist/org",
        {
          method: "POST",
          token,
          body: { symbol: result.symbol, name: result.name },
        }
      );
      addToOrgWatchlist(res.data);
    } catch (e) {
      console.error("Failed to add to org watchlist", e);
    }
  };

  const handleRemoveFromOrgWatchlist = async (symbol: string) => {
    try {
      await api(`/watchlist/org/${symbol}`, { method: "DELETE", token });
      removeFromOrgWatchlist(symbol);
    } catch (e) {
      console.error("Failed to remove from org watchlist", e);
    }
  };

  const isInWatchlist = (symbol: string) =>
    watchlist.some((w) => w.symbol === symbol);
  const isInOrgWatchlist = (symbol: string) =>
    orgWatchlist.some((w) => w.symbol === symbol);

  return (
    <div className="flex flex-col h-full">
      {/* Search Top Bar */}
      <div className="p-4 border-b border-[#1c2940]" ref={searchRef}>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            size={16}
          />
          {searchLoading && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin"
              size={14}
            />
          )}
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="w-full bg-[#0a0f1c] border border-[#1c2940] rounded-lg py-2 pl-9 pr-9 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
          />
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 left-3 right-3 mt-2 bg-[#0d1424] border border-[#1c2940] rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
            >
              {searchResults.map((result) => {
                const alreadyAdded = isInWatchlist(result.symbol);
                return (
                  <div
                    key={result.symbol}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#1c2940]/60 transition-colors border-b border-[#1c2940]/40 last:border-b-0 cursor-pointer"
                    onClick={() => {
                      handleSelectStock(result.symbol, result.name);
                      setShowResults(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <div>
                      <div className="font-bold text-sm text-white font-mono">
                        {result.symbol}
                      </div>
                      <div className="text-xs text-white/40 truncate max-w-[130px]">
                        {result.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!alreadyAdded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWatchlist(result);
                          }}
                          title="Add to Watchlist"
                          className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                      {user?.organizationId &&
                        !isInOrgWatchlist(result.symbol) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToOrgWatchlist(result);
                            }}
                            title="Add to Org Watchlist"
                            className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                          >
                            <Building2 size={14} />
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Watchlists */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 gap-6 custom-scrollbar">
        {/* Personal Watchlist */}
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
            <Star size={14} />
            <span>My Watchlist</span>
            <span className="ml-auto text-white/20 font-mono">
              {watchlist.length}
            </span>
          </div>

          {watchlist.length === 0 ? (
            <div className="text-center py-6 text-white/20 text-xs font-mono">
              Search and add stocks to your watchlist
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {watchlist.map((item, idx) => {
                const mock = getMockPrice(item.symbol);
                const isSelected = selectedSymbol === item.symbol;
                const isPositive = mock.changePercent >= 0;

                return (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md
                      ${
                        isSelected
                          ? "bg-[#2962ff]/20 border-[#2962ff]/50 shadow-[0_0_20px_rgba(41,98,255,0.25)]"
                          : "bg-[#0a0f1c]/80 border-[#1c2940]/50 hover:bg-[#1c2940]/80 hover:border-[#1c2940]"
                      }`}
                    onClick={() =>
                      handleSelectStock(item.symbol, item.name)
                    }
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white font-mono">
                        {item.symbol}
                      </div>
                      <div className="text-xs text-white/40 truncate max-w-[110px]">
                        {item.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono text-sm text-white">
                          ₹{mock.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-mono flex items-center justify-end gap-1 ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp size={11} />
                          ) : (
                            <TrendingDown size={11} />
                          )}
                          {Math.abs(mock.changePercent).toFixed(2)}%
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist(item.symbol);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400/70 hover:text-rose-400 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Organization Watchlist */}
        {user?.organizationId && (
          <div>
            <div className="flex items-center gap-2 text-blue-400/60 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 size={14} />
              <span>Org Watchlist</span>
              <span className="ml-auto text-white/20 font-mono">
                {orgWatchlist.length}
              </span>
            </div>

            {orgWatchlist.length === 0 ? (
              <div className="text-center py-4 text-white/20 text-xs font-mono">
                No org stocks yet
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {orgWatchlist.map((item, idx) => {
                  const mock = getMockPrice(item.symbol);
                  const isSelected = selectedSymbol === item.symbol;
                  const isPositive = mock.changePercent >= 0;

                  return (
                    <motion.div
                      key={item.symbol}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md
                        ${
                          isSelected
                            ? "bg-blue-500/15 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                            : "bg-[#0a0f1c]/80 border-blue-900/30 hover:bg-[#1c2940]/60 hover:border-blue-800/40"
                        }`}
                      onClick={() =>
                        handleSelectStock(item.symbol, item.name)
                      }
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white font-mono">
                          {item.symbol}
                        </div>
                        <div className="text-xs text-white/40 truncate max-w-[110px]">
                          {item.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-mono text-sm text-white">
                            ₹{mock.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-xs font-mono flex items-center justify-end gap-1 ${
                              isPositive
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp size={11} />
                            ) : (
                              <TrendingDown size={11} />
                            )}
                            {Math.abs(mock.changePercent).toFixed(2)}%
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromOrgWatchlist(item.symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-rose-400/70 hover:text-rose-400 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Summary Mini-card */}
      <div className="p-4 border-t border-[#1c2940] bg-[#0a0f1c]/50">
        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
          Watchlist Stocks
        </div>
        <div className="text-xl font-mono font-bold text-white">
          {watchlist.length + orgWatchlist.length}
        </div>
        <div className="text-xs text-emerald-400/60 font-mono mt-1">
          {watchlist.length} personal · {orgWatchlist.length} org
        </div>
      </div>
    </div>
  );
}
