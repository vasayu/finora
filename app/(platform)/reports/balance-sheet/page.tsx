"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { Sparkles, FileText, Activity } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  themeBalham,
} from "ag-grid-community";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function BalanceSheetPage() {
  const { token } = useAuth();
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  useEffect(() => {
    const fetchBS = async () => {
      try {
        const res = await api("/financials/balance-sheet", { token });
        setRowData(Array.isArray(res.data) ? res.data : []);
      } catch {
        setRowData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBS();
  }, [token]);

  const runAnalysis = async () => {
    if (rowData.length === 0) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const promptData = JSON.stringify(rowData);
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
      { field: "mainCategory", headerName: "Category", minWidth: 150 },
      { field: "subCategory", headerName: "Sub Category", minWidth: 200 },
      { field: "account", headerName: "Account", minWidth: 250 },
      {
        field: "balance",
        headerName: "Balance",
        valueFormatter: (params: any) =>
          params.value != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(params.value)
            : "",
        cellClass: "text-right font-mono text-emerald-400 font-medium",
        headerClass: "text-right",
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      resizable: true,
      sortable: true,
    }),
    [],
  );

  // Custom Balham dark theme matching Finora aesthetics
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            Balance Sheet
          </h1>
          <p className="text-foreground/50 text-sm mt-1">
            Detailed asset, liability, and equity ledger
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* AG Grid Section */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#0a0a0a] border border-white/[0.06] rounded-2xl relative">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : null}

          <div className="flex-1 w-full h-full p-4">
            <AgGridReact
              theme={myTheme}
              rowData={rowData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
            />
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="w-[400px] bg-[#0a0a0a] border border-white/[0.06] rounded-2xl flex flex-col shrink-0 overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="font-semibold text-foreground">AI Insights</span>
            </div>
            {analysis && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1">
                <Activity size={12} /> Live
              </span>
            )}
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

          <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
            <button
              onClick={runAnalysis}
              disabled={analyzing || loading || rowData.length === 0}
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
