import React from "react";
import LeftSidebar from "@/Components/Terminal/LeftSidebar";
import RightSidebar from "@/Components/Terminal/RightSidebar";
import TradingChart from "@/Components/Terminal/TradingChart";
import BottomPanel from "@/Components/Terminal/BottomPanel";

export default function TerminalPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-[#0a0f1c] text-white flex flex-col overflow-hidden">
      {/* Terminal Header */}
      <header className="h-14 border-b border-[#1c2940] flex items-center px-4 shrink-0 bg-[#0d1424]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="font-mono text-sm uppercase tracking-wider text-emerald-500">
            Terminal Online // Live Market Data
          </h1>
        </div>
      </header>

      {/* 4-Pane Terminal Layout Grid */}
      <div className="flex-1 grid grid-cols-[280px_1fr_340px] grid-rows-[1fr_320px] overflow-hidden">
        {/* Left Sidebar (Watchlist & Search) */}
        <div className="row-span-2 border-r border-[#1c2940] bg-[#0d1424] overflow-y-auto custom-scrollbar">
          <LeftSidebar />
        </div>

        {/* Main Chart Region */}
        <div className="relative border-b border-[#1c2940] p-4 flex flex-col min-h-0 bg-[#0a0f1c]">
          <div className="flex-1 border border-[#1c2940] rounded-xl flex items-center justify-center bg-[#0d1424] overflow-hidden">
            <TradingChart />
          </div>
        </div>

        {/* Right Sidebar (AI Prediction Engine) */}
        <div className="row-span-2 border-l border-[#1c2940] bg-[#0d1424] overflow-y-auto custom-scrollbar">
          <RightSidebar />
        </div>

        {/* Bottom Region (Balance Sheet Grid) */}
        <div className="col-start-2 relative p-4 flex flex-col min-h-0 bg-[#0a0f1c]">
          <div className="flex-1 border border-[#1c2940] rounded-xl flex items-center justify-center bg-[#0d1424] overflow-hidden">
            <BottomPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
