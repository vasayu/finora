"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeBalham } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import { useTerminalStore } from "@/lib/store/terminalStore";
import { api } from "@/lib/api";
import { Table, ServerCrash } from "lucide-react";

export default function BottomPanel() {
  const { selectedSymbol } = useTerminalStore();
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBalanceSheet = async () => {
      setLoading(true);
      setError(false);
      try {
        // To keep the demo fast, we'll fetch the same generic balance sheet we built earlier
        // In a real scenario, this would take `?symbol=${selectedSymbol}`
        const res = await api("/financials/balance-sheet");
        if (isMounted && res.data?.detailed) {
          // Flatten out the detailed response for community grid display
          const flatData: any[] = [];
          Object.entries(res.data.detailed).forEach(
            ([mainCategory, subTree]: [string, any]) => {
              Object.entries(subTree).forEach(
                ([subCategory, accounts]: [string, any]) => {
                  Object.entries(accounts).forEach(
                    ([account, balance]: [string, any]) => {
                      flatData.push({
                        mainCategory,
                        subCategory,
                        account,
                        balance,
                      });
                    },
                  );
                },
              );
            },
          );

          setRowData(flatData);
        }
      } catch (err) {
        console.error("Failed to fetch balance sheet terminal data:", err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBalanceSheet();
    return () => {
      isMounted = false;
    };
  }, [selectedSymbol]);

  const colDefs = useMemo<any[]>(
    () => [
      {
        field: "mainCategory",
        headerName: "Category",
        minWidth: 150,
        cellClass: "font-bold",
      },
      { field: "subCategory", headerName: "Sub Category", minWidth: 200 },
      { field: "account", headerName: "Account", minWidth: 250 },
      {
        field: "balance",
        headerName: "Reported Value",
        valueFormatter: (params: any) =>
          params.value != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(params.value)
            : "",
        cellClass: (params: any) => {
          const isNeg = params.value < 0;
          return `text-right font-mono font-medium ${isNeg ? "text-amber-400" : "text-emerald-400"}`;
        },
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
      filter: true,
    }),
    [],
  );

  const terminalTheme = themeBalham.withParams({
    backgroundColor: "#0d1424",
    foregroundColor: "#94a3b8",
    headerBackgroundColor: "#1c2940",
    headerTextColor: "#cbd5e1",
    borderColor: "rgba(255,255,255,0.05)",
    rowHoverColor: "rgba(41,98,255,0.1)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    headerFontSize: 11,
  });

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-2 px-4 border-b border-[#1c2940] bg-[#0d1424] shrink-0">
        <div className="flex items-center gap-2">
          <Table size={14} className="text-[#2962ff]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Fundamental Data: Balance Sheet
          </span>
        </div>
        {loading && (
          <div className="w-3 h-3 rounded-full border border-[#2962ff] border-t-transparent animate-spin" />
        )}
      </div>

      <div className="flex-1 w-full bg-[#0d1424] relative">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-500/50 gap-2">
            <ServerCrash size={24} />
            <span className="text-xs font-mono uppercase">
              Data Feed Offline
            </span>
          </div>
        ) : (
          <AgGridReact
            theme={terminalTheme}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
          />
        )}
      </div>
    </div>
  );
}
