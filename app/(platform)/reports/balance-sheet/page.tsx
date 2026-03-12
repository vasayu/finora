"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import {
  FileText,
  Sparkles,
  Activity,
  Download,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Table,
  TrendingUp,
  TrendingDown,
  Layers,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  themeBalham,
} from "ag-grid-community";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface BSRow {
  section: string;
  subSection: string;
  account: string;
  balance: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
}

interface BalanceSheetData {
  rows: BSRow[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanced: boolean;
  asOfDate: string;
}

const formatCurrency = (value: number) => {
  const absVal = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absVal);
  return value < 0 ? `(${formatted})` : formatted;
};

export default function BalanceSheetPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"modern" | "grid">("modern");
  const [fullScreenPanel, setFullScreenPanel] = useState<"ledger" | "ai" | null>(null);

  const isLedgerFS = fullScreenPanel === "ledger";
  const isAiFS = fullScreenPanel === "ai";
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchBS = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ status: string; data: BalanceSheetData }>(
        `/financials/balance-sheet?asOfDate=${asOfDate}`,
        { token }
      );
      setData(res.data);
    } catch (e) {
      console.error("Failed to fetch balance sheet", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token, asOfDate]);

  useEffect(() => {
    fetchBS();
  }, [fetchBS]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/financials/balance-sheet/export?asOfDate=${asOfDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BalanceSheet_${asOfDate}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  const runAnalysis = async () => {
    if (!data || data.rows.length === 0) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const promptData = JSON.stringify(data.rows);
      const res = await api("/ai/analyze", {
        method: "POST",
        token,
        body: {
          query: `Analyze this Balance Sheet data: ${promptData}. Provide a professional assessment of liquidity, solvency, and recommendations. Format with clear headings.`,
        },
      });
      const result =
        typeof res.data?.analysis === "string"
          ? res.data.analysis
          : res.data?.analysis?.analysis || "Analysis failed.";
      setAnalysis(result);
    } catch (err: any) {
      setAnalysis(`Error analyzing data: ${err.message || "Unknown error"}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const colDefs = useMemo<any[]>(
    () => [
      { field: "section", headerName: "Section", minWidth: 150 },
      { field: "subSection", headerName: "Sub Section", minWidth: 200 },
      { field: "account", headerName: "Account", minWidth: 250 },
      {
        field: "balance",
        headerName: "Balance",
        valueFormatter: (params: any) =>
          params.value != null ? formatCurrency(params.value) : "",
        cellClass: "text-right font-mono text-emerald-400 font-medium",
        headerClass: "text-right",
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      resizable: true,
      sortable: true,
    }),
    []
  );

  const myTheme = themeBalham.withParams({
    backgroundColor: "#0a0a0a",
    foregroundColor: "#ededed",
    headerBackgroundColor: "#111111",
    headerTextColor: "#a3a3a3",
    borderColor: "rgba(255,255,255,0.06)",
    rowHoverColor: "rgba(255,255,255,0.02)",
    fontFamily: "inherit",
    fontSize: 14,
  });

  // Group rows by section for rendering
  const sections = data
    ? (["ASSETS", "LIABILITIES", "EQUITY"] as const).map((section) => ({
        section,
        rows: data.rows.filter((r) => r.section === section),
      }))
    : [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      {!fullScreenPanel && (
        <div className="mb-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="text-primary" size={24} />
              Balance Sheet
            </h1>
            <p className="text-foreground/50 text-sm mt-1">
              Transaction-driven asset, liability, and equity ledger
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-white/3 border border-white/8 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode("modern")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === "modern"
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <FileText size={14} />
                Modern
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Table size={14} />
                Excel View
              </button>
            </div>

            {/* As-Of Date Picker */}
            <div className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-3 py-2">
              <Calendar size={16} className="text-primary" />
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="bg-transparent text-foreground text-sm font-mono focus:outline-none"
              />
            </div>

            {/* Balance Check */}
            {data && (
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium ${
                  data.balanced
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {data.balanced ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                {data.balanced ? "A = L + E ✓" : "Imbalanced ✗"}
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/8 hover:border-white/15 text-foreground/80 hover:text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <Download size={16} />
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards (Grand Summary Moved to Top) */}
      {data && !fullScreenPanel && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
          <div className="bg-[#0a0a0a] border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={48} className="text-emerald-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-foreground/50 uppercase tracking-widest font-semibold mb-2">
                Total Assets
              </p>
              <p className="text-3xl font-bold font-mono text-emerald-400">
                {formatCurrency(data.totalAssets)}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500/50 to-transparent" />
          </div>

          <div className="bg-[#0a0a0a] border border-rose-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingDown size={48} className="text-rose-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-foreground/50 uppercase tracking-widest font-semibold mb-2">
                Total Liabilities
              </p>
              <p className="text-3xl font-bold font-mono text-rose-400">
                {formatCurrency(data.totalLiabilities)}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-rose-500/50 to-transparent" />
          </div>

          <div className="bg-[#0a0a0a] border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers size={48} className="text-blue-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-foreground/50 uppercase tracking-widest font-semibold mb-2">
                Total Equity
              </p>
              <p className="text-3xl font-bold font-mono text-blue-400">
                {formatCurrency(data.totalEquity)}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-blue-500/50 to-transparent" />
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Balance Sheet Ledger */}
        <div
          className={`bg-[#0a0a0a] border border-white/6 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isLedgerFS
              ? "flex-1"
              : isAiFS
                ? "hidden"
                : "w-[60%] min-w-[30%] max-w-[80%] resize-x"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/6 bg-white/2 shrink-0">
            <div className="flex items-center gap-2">
              <Table size={18} className="text-primary" />
              <span className="font-semibold text-foreground">Ledger View</span>
            </div>
            <button
              onClick={() => setFullScreenPanel(isLedgerFS ? null : "ledger")}
              className="text-foreground/50 hover:text-foreground p-1 transition-colors"
              title={isLedgerFS ? "Exit Full Screen" : "Full Screen"}
            >
              {isLedgerFS ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : !data || data.rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-foreground/30 gap-3">
              <FileText size={40} />
              <p className="text-sm">
                No transactions found. Add transactions to generate a Balance
                Sheet.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="w-full h-full min-h-[500px]">
              <AgGridReact
                theme={myTheme}
                rowData={data.rows}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* As-Of Date Label */}
              <div className="text-center">
                <p className="text-foreground/40 text-xs uppercase tracking-wider">
                  As of{" "}
                  {new Date(data.asOfDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {sections.map(({ section, rows }) => {
                const sectionColor =
                  section === "ASSETS"
                    ? "text-emerald-400"
                    : section === "LIABILITIES"
                      ? "text-rose-400"
                      : "text-blue-400";
                const sectionBg =
                  section === "ASSETS"
                    ? "bg-emerald-500/5"
                    : section === "LIABILITIES"
                      ? "bg-rose-500/5"
                      : "bg-blue-500/5";

                let lastSubSection = "";

                return (
                  <div key={section}>
                    {/* Section Header */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 rounded-xl ${sectionBg} mb-3`}
                    >
                      <span
                        className={`font-bold text-sm uppercase tracking-wider ${sectionColor}`}
                      >
                        {section}
                      </span>
                    </div>

                    {/* Rows */}
                    <div className="space-y-0.5">
                      {rows.map((row, idx) => {
                        const showSubHeader =
                          !row.isSubtotal &&
                          !row.isTotal &&
                          row.subSection !== lastSubSection;
                        if (
                          !row.isSubtotal &&
                          !row.isTotal &&
                          row.subSection
                        ) {
                          lastSubSection = row.subSection;
                        }

                        return (
                          <React.Fragment key={`${section}-${idx}`}>
                            {showSubHeader && (
                              <div className="px-4 pt-3 pb-1">
                                <span className="text-foreground/40 text-xs font-semibold uppercase tracking-wider">
                                  {row.subSection}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                                row.isTotal
                                  ? "bg-white/4 border border-white/8 mt-2"
                                  : row.isSubtotal
                                    ? "border-t border-white/6 mt-1"
                                    : "hover:bg-white/2"
                              }`}
                            >
                              <span
                                className={`text-sm ${
                                  row.isTotal
                                    ? "font-bold text-foreground"
                                    : row.isSubtotal
                                      ? "font-semibold text-foreground/80 pl-2"
                                      : "text-foreground/70 pl-6"
                                }`}
                              >
                                {row.account}
                              </span>
                              <span
                                className={`font-mono text-sm tabular-nums ${
                                  row.isTotal
                                    ? `font-bold ${sectionColor}`
                                    : row.isSubtotal
                                      ? "font-semibold text-foreground/80"
                                      : row.balance < 0
                                        ? "text-rose-400/80"
                                        : "text-foreground/60"
                                }`}
                              >
                                {formatCurrency(row.balance)}
                              </span>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div
          className={`bg-[#0a0a0a] border border-white/6 rounded-2xl flex flex-col shrink-0 overflow-hidden transition-all duration-300 ${
            isAiFS
              ? "flex-1"
              : isLedgerFS
                ? "hidden"
                : "flex-1 min-w-[350px] max-w-[800px] resize-x overflow-auto"
          }`}
        >
          <div className="p-4 border-b border-white/6 flex items-center justify-between bg-white/2 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="font-semibold text-foreground">AI Insights</span>
            </div>
            <div className="flex items-center gap-2">
              {analysis && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1">
                  <Activity size={12} /> Live
                </span>
              )}
              <button
                onClick={() => setFullScreenPanel(isAiFS ? null : "ai")}
                className="text-foreground/50 hover:text-foreground p-1 transition-colors"
                title={isAiFS ? "Exit Full Screen" : "Full Screen"}
              >
                {isAiFS ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {!analysis && !analyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="text-primary w-8 h-8 opacity-80" />
                </div>
                <div>
                  <h3 className="text-foreground font-medium mb-1">
                    Needs Analysis
                  </h3>
                  <p className="text-foreground/40 text-sm">
                    Click the button below to generate a comprehensive AI
                    assessment of your balance sheet health.
                  </p>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full bg-primary/80 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary/80 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary/80 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <p className="text-primary text-sm font-medium animate-pulse">
                  Running financial models...
                </p>
              </div>
            )}

            {analysis && !analyzing && (
              <div className="prose prose-invert prose-sm max-w-none text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {analysis}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/6 bg-white/1">
            <button
              onClick={runAnalysis}
              disabled={analyzing || loading || !data || data.rows.length === 0}
              className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-primary shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
            >
              {analyzing ? (
                "Analyzing Ledger..."
              ) : (
                <>
                  <Sparkles size={16} />
                  {analysis ? "Regenerate Analysis" : "Analyze Balance Sheet"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
