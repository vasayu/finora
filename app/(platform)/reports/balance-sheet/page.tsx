"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@/Components/AuthProvider";
import { useRouter } from "next/navigation";
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
  Eye,
  EyeOff,
  X,
  StickyNote,
  AlertCircle,
  Pencil,
  Check,
  ExternalLink,
  Zap,
  BrainCircuit,
  MessageSquareWarning,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  type ICellRendererParams,
} from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

// ─── Types ────────────────────────────────────────────────────────────────────

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

type ChangeFlag = "LARGE_CHANGE" | "ZERO_TO_NONZERO" | "NEGATIVE_UNEXPECTED";

interface CompareRow {
  section: string;
  subSection: string;
  account: string;
  current: number;
  previous: number;
  absChange: number;
  pctChange: number | null;
  flags: ChangeFlag[];
  impactScore: number;
  status: "HEALTHY" | "RISK" | "CRITICAL";
  isSubtotal?: boolean;
  isTotal?: boolean;
}

interface CompareResult {
  rows: CompareRow[];
  asOfDate: string;
  prevDate: string;
  currentTotals: {
    assets: number;
    liabilities: number;
    equity: number;
    balanced: boolean;
  };
}

interface DrillTransaction {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
}

interface DrillResult {
  account: string;
  transactions: DrillTransaction[];
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(v)) + (v < 0 ? " (CR)" : "");

const fmtChange = (v: number) => {
  const abs = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(v));
  return v > 0 ? `+${abs}` : v < 0 ? `-${abs}` : abs;
};

const oneMonthBefore = (dateStr: string) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split("T")[0];
};

// ─── Cell Renderers ───────────────────────────────────────────────────────────

const PctChangeBadge = (params: ICellRendererParams) => {
  const { value, data } = params;
  if (data?.isSubtotal || data?.isTotal) return null;
  if (value === null || value === undefined)
    return <span className="text-white/20 font-mono text-xs">N/A</span>;
  const pct = value as number;
  const abs = Math.abs(pct);
  let cls = "bg-white/10 text-white/40";
  if (abs > 20)
    cls = pct > 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300";
  else if (pct > 0) cls = "bg-emerald-500/10 text-emerald-400/80";
  else if (pct < 0) cls = "bg-rose-500/10 text-rose-400/80";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium ${cls}`}
    >
      {pct > 0 ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
};

const FlagCell = (
  params: ICellRendererParams & {
    onNote: (account: string) => void;
    notes: Record<string, string>;
    highlightRisks: boolean;
  }
) => {
  const { data } = params;
  if (!data || data.isSubtotal || data.isTotal) return null;
  const flags: ChangeFlag[] = data.flags || [];
  const note = params.notes?.[data.account];
  return (
    <div className="flex items-center gap-1.5 h-full">
      {params.highlightRisks && flags.includes("NEGATIVE_UNEXPECTED") && (
        <span title="Negative value where unexpected" className="text-rose-400 text-xs">
          <AlertCircle size={13} />
        </span>
      )}
      {params.highlightRisks && flags.includes("LARGE_CHANGE") && (
        <span title="Large change >20%" className="text-amber-400 text-xs">⚡</span>
      )}
      {params.highlightRisks && flags.includes("ZERO_TO_NONZERO") && (
        <span title="New entry this period" className="text-blue-400 text-xs">✦</span>
      )}
      {note && (
        <button
          type="button"
          title={note}
          className="text-violet-400 cursor-pointer hover:text-violet-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            params.onNote(data.account);
          }}
        >
          <StickyNote size={13} />
        </button>
      )}
      {!note && !data.isTotal && !data.isSubtotal && (
        <button
          type="button"
          title="Add note"
          className="text-white/20 hover:text-white/50 cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            params.onNote(data.account);
          }}
        >
          <Pencil size={11} />
        </button>
      )}
    </div>
  );
};

const AccountCell = (
  params: ICellRendererParams & { onDrill: (account: string) => void }
) => {
  const { data } = params;
  if (!data) return <span>{params.value}</span>;
  if (data.isTotal)
    return (
      <span className="font-bold tracking-wide text-white/90 uppercase text-xs">
        {params.value}
      </span>
    );
  if (data.isSubtotal)
    return (
      <span className="font-semibold text-white/70 italic pl-2">{params.value}</span>
    );
  return (
    <button
      className="flex items-center gap-1.5 text-left hover:text-blue-400 transition-colors group pl-4 w-full"
      onClick={() => params.onDrill(data.account)}
    >
      <span className="text-white/70 group-hover:text-blue-400 text-sm">
        {params.value}
      </span>
      <ExternalLink
        size={11}
        className="text-white/20 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      />
    </button>
  );
};

// ─── Drill-Down Panel ─────────────────────────────────────────────────────────

function DrillPanel({
  account,
  asOfDate,
  token,
  organizationId,
  onClose,
}: {
  account: string | null;
  asOfDate: string;
  token: string | null;
  organizationId?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [data, setData] = useState<DrillResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    setData(null);
    const params = new URLSearchParams({ account, asOfDate });
    if (organizationId) params.set("organizationId", organizationId);
    api<{ status: string; data: DrillResult }>(
      `/financials/balance-sheet/account-drill?${params}`,
      { token }
    )
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [account, asOfDate, token, organizationId]);

  if (!account) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/8 w-[380px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/2 shrink-0">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
            Account Drill-Down
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">{account}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white/70 transition-colors p-1"
        >
          <X size={16} />
        </button>
      </div>

      {/* Net total */}
      {data && (
        <div className="px-4 py-2.5 border-b border-white/6 bg-white/1 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">Net Balance</span>
            <span
              className={`font-mono font-bold text-sm ${data.total >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {fmt(data.total)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-white/30">Transactions</span>
            <span className="text-xs text-white/50 font-mono">
              {data.transactions.length}
            </span>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        {!loading && data && data.transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-white/25 gap-2">
            <FileText size={24} />
            <p className="text-xs">No transactions</p>
          </div>
        )}
        {!loading &&
          data?.transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-start justify-between px-4 py-2.5 border-b border-white/4 hover:bg-white/2 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      tx.type === "INCOME"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? "IN" : "EX"}
                  </span>
                  <span className="text-xs text-white/50 font-mono">{tx.date}</span>
                </div>
                <p className="text-xs text-white/70 mt-1 truncate font-medium">
                  {tx.category}
                </p>
                {tx.description && (
                  <p className="text-[11px] text-white/35 truncate">{tx.description}</p>
                )}
              </div>
              <span
                className={`font-mono text-xs font-medium shrink-0 ${
                  tx.type === "INCOME" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  minimumFractionDigits: 0,
                }).format(tx.amount)}
              </span>
            </div>
          ))}
      </div>

      {/* Footer — link to transactions page */}
      <div className="px-4 py-3 border-t border-white/8 bg-white/1 shrink-0">
        <button
          onClick={() => router.push("/transactions")}
          className="w-full flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors py-1"
        >
          <ExternalLink size={12} />
          View all transactions
        </button>
      </div>
    </div>
  );
}

// ─── Notes Popover ────────────────────────────────────────────────────────────

function NotePopover({
  account,
  notes,
  onSave,
  onClose,
}: {
  account: string | null;
  notes: Record<string, string>;
  onSave: (account: string, text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (account) setText(notes[account] || "");
  }, [account, notes]);

  if (!account) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/12 rounded-2xl w-[440px] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">Annotation</p>
            <p className="text-sm font-semibold text-white mt-0.5">{account}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <textarea
            className="w-full h-28 bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/80 resize-none focus:outline-none focus:border-blue-500/50 placeholder:text-white/20"
            placeholder="e.g. Receivables spike due to delayed client payments…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            {notes[account] && (
              <button
                onClick={() => { onSave(account, ""); onClose(); }}
                className="px-4 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Clear note
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(account, text); onClose(); }}
              className="px-4 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <Check size={12} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CFO Workbench (Excel View) ───────────────────────────────────────────────

function CFOWorkbench({
  asOfDate,
  token,
  organizationId,
}: {
  asOfDate: string;
  token: string | null;
  organizationId?: string;
}) {
  const [prevDate, setPrevDate] = useState(() => oneMonthBefore(asOfDate));
  const [compareData, setCompareData] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangesOnly, setShowChangesOnly] = useState(false);
  const [highlightRisks, setHighlightRisks] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<
    "ALL" | "ASSETS" | "LIABILITIES" | "EQUITY"
  >("ALL");
  const [drillAccount, setDrillAccount] = useState<string | null>(null);
  const [noteAccount, setNoteAccount] = useState<string | null>(null);
  const [explainModal, setExplainModal] = useState<{ account: string | null, text: string, loading: boolean }>({ account: null, text: "", loading: false });
  const [tableFullScreen, setTableFullScreen] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("finora_bs_notes") || "{}");
    } catch {
      return {};
    }
  });
  const gridRef = useRef<any>(null);

  const handleExplain = async (account: string) => {
    setExplainModal({ account, text: "", loading: true });
    try {
      const p = new URLSearchParams({ account, asOfDate });
      if (organizationId) p.set("organizationId", organizationId);
      const res = await api<{ data: { transactions: any[] } }>(`/financials/balance-sheet/account-drill?${p}`, { token });
      const txs = res.data.transactions || [];
      
      if (txs.length === 0) {
        setExplainModal({ account, text: "Wait, there are no recent transactions here. The change is likely driven by earlier historical corrections, bulk imports without recent dates, or sub-account consolidation.", loading: false });
        return;
      }
      
      const catMap: Record<string, number> = {};
      let topCat = "";
      let maxCat = 0;
      txs.forEach(t => {
          catMap[t.category] = (catMap[t.category] || 0) + 1;
          if (catMap[t.category] > maxCat) {
              maxCat = catMap[t.category];
              topCat = t.category;
          }
      });
      
      const text = `The balance in ${account} changed primarily due to ${txs.length} ${txs.length === 1 ? 'entry' : 'entries'} in the trailing period. The top contributing factor was activity related to "${topCat || 'Mixed Transactions'}" (${maxCat} ${maxCat === 1 ? 'item' : 'items'}).`;
      setExplainModal({ account, text, loading: false });
    } catch (err) {
      setExplainModal({ account, text: "Failed to generate explanation due to an API error.", loading: false });
    }
  };

  // Sync prevDate when asOfDate changes
  useEffect(() => {
    setPrevDate(oneMonthBefore(asOfDate));
  }, [asOfDate]);

  // Fetch comparison data
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ asOfDate, prevDate });
    if (organizationId) params.set("organizationId", organizationId);
    api<{ status: string; data: CompareResult }>(
      `/financials/balance-sheet/compare?${params}`,
      { token }
    )
      .then((r) => setCompareData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asOfDate, prevDate, token, organizationId]);

  // Persist notes
  const saveNote = useCallback((account: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      if (text) next[account] = text;
      else delete next[account];
      localStorage.setItem("finora_bs_notes", JSON.stringify(next));
      return next;
    });
  }, []);

  // CSV export
  const exportCSV = useCallback(() => {
    if (!compareData) return;
    const rows = compareData.rows;
    const headers = [
      "Section",
      "Sub-Section",
      "Account",
      "Current",
      "Previous",
      "Abs Change",
      "% Change",
      "Flags",
      "Note",
    ];
    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        [
          r.section,
          r.subSection,
          `"${r.account}"`,
          r.current,
          r.previous,
          r.absChange,
          r.pctChange ?? "N/A",
          `"${r.flags.join("; ")}"`,
          `"${notes[r.account] || ""}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BalanceSheet_Compare_${asOfDate}_vs_${prevDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [compareData, notes, asOfDate, prevDate]);

  // Build filtered row data
  const rowData = useMemo(() => {
    if (!compareData) return [];
    let rows = compareData.rows;
    if (sectionFilter !== "ALL") {
      rows = rows.filter(
        (r) => r.section === sectionFilter || r.isTotal || r.isSubtotal
      );
    }
    if (showChangesOnly) {
      rows = rows.filter((r) => r.absChange !== 0 || r.isTotal);
    }
    return rows;
  }, [compareData, sectionFilter, showChangesOnly]);

  // Build risk count for toolbar indicator
  const riskCount = useMemo(
    () =>
      compareData?.rows.filter(
        (r) => !r.isTotal && !r.isSubtotal && r.flags.length > 0
      ).length ?? 0,
    [compareData]
  );

  // AG Grid theme
  const myTheme = useMemo(
    () =>
      themeQuartz.withParams({
        backgroundColor: "#0a0a0a",
        foregroundColor: "#d4d4d8",
        headerBackgroundColor: "#121212",
        headerTextColor: "#a1a1aa",
        borderColor: "rgba(255,255,255,0.06)",
        rowHoverColor: "rgba(255,255,255,0.03)",
        rowBorder: true,
        columnBorder: false,
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        headerFontSize: 12,
        headerFontWeight: 600,
        cellHorizontalPaddingScale: 0.9,
        wrapperBorderRadius: 8,
        spacing: 6,
      }),
    []
  );

  // --- CFO Insight Computations ---
  const insightData = useMemo(() => {
    if (!compareData) return { biggestIncrease: null, biggestRisk: null, stableArea: null, insights: [], topDrivers: [], hasAnomaly: false };
    
    const validRows = compareData.rows.filter(r => !r.isTotal && !r.isSubtotal);
    
    // Top Drivers (sorted by absolute change descending)
    const sortedByAbs = [...validRows].sort((a,b) => Math.abs(b.absChange) - Math.abs(a.absChange));
    const topDrivers = sortedByAbs.slice(0, 3);
    
    const biggestIncrease = [...validRows].sort((a,b) => b.absChange - a.absChange)[0];
    
    const risks = validRows.filter(r => r.status === 'RISK' || r.status === 'CRITICAL');
    const biggestRisk = risks.sort((a,b) => b.impactScore - a.impactScore)[0] || null;
    
    const stableArea = validRows.find(r => r.pctChange !== null && Math.abs(r.pctChange) < 2 && r.current > 1000) || null;
    
    const insights: string[] = [];
    let hasAnomaly = false;
    
    validRows.forEach(r => {
      if (r.pctChange !== null && r.pctChange > 500 && r.current > 100) {
          insights.push(`⚠️ ${r.account} spiked by ${r.pctChange.toFixed(0)}% — verify for anomaly or bulk import.`);
          hasAnomaly = true;
      }
      if (r.pctChange !== null && r.pctChange < -80 && r.section === 'ASSETS' && r.previous > 100) {
          insights.push(`⚠️ Massive drop in ${r.account} (${r.pctChange.toFixed(0)}%). Cashflow risk.`);
      }
      if (r.status === 'CRITICAL' && r.current < 0 && r.section === 'ASSETS') {
          insights.push(`🚨 CRITICAL: ${r.account} is negative. Immediate reconciliation required.`);
          hasAnomaly = true;
      }
      if (r.previous === 0 && r.current > 100) {
          insights.push(`ℹ️ New balance detected in ${r.account} (+₹${r.absChange.toLocaleString()}).`);
      }
    });
    
    if (!validRows.some(r => r.section === 'LIABILITIES' && r.current > 0)) {
        insights.push(`✅ No reported liabilities or debt. Strong financial health.`);
    }

    return { biggestIncrease, biggestRisk, stableArea, insights: insights.slice(0, 5), topDrivers, hasAnomaly };
  }, [compareData]);

  // Column definitions
  const colDefs = useMemo<any[]>(() => {
    const onDrill = (acc: string) => setDrillAccount(acc);
    const onNote = (acc: string) => setNoteAccount(acc);
    const onExplain = (acc: string) => handleExplain(acc);

    return [
      {
        field: "section",
        headerName: "Section",
        width: 120,
        filter: true,
        hide: sectionFilter !== "ALL",
        cellStyle: { color: "#71717a", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" },
      },
      {
        field: "subSection",
        headerName: "Sub-Section",
        minWidth: 160,
        filter: true,
        cellStyle: (p: any) => ({
          color: p.data?.isTotal ? "transparent" : "#a1a1aa",
          fontSize: "13px",
        }),
      },
      {
        field: "account",
        headerName: "Account",
        minWidth: 260,
        filter: true,
        cellRenderer: (p: ICellRendererParams) =>
          AccountCell({ ...p, onDrill }),
        cellStyle: (p: any) => {
          const hasFlag = p.data?.flags?.length > 0 && highlightRisks;
          const hasNeg = p.data?.flags?.includes("NEGATIVE_UNEXPECTED") && highlightRisks;
          return {
            background: hasNeg
              ? "rgba(239, 68, 68, 0.05)"
              : hasFlag
              ? "rgba(234, 179, 8, 0.04)"
              : "transparent",
            borderLeft: hasNeg
              ? "3px solid rgba(239, 68, 68, 0.6)"
              : hasFlag
              ? "3px solid rgba(234, 179, 8, 0.5)"
              : "3px solid transparent",
            paddingLeft: "12px",
          };
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        sortable: false,
        filter: true,
        cellRenderer: (p: any) => {
          if (p.data?.isTotal || p.data?.isSubtotal) return null;
          const s = p.value;
          if (s === "CRITICAL") return <div className="flex h-full items-center"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"><AlertTriangle size={12}/> CRITICAL</span></div>;
          if (s === "RISK") return <div className="flex h-full items-center"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm"><AlertCircle size={12}/> RISK</span></div>;
          return <div className="flex h-full items-center"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"><Check size={12}/> HEALTHY</span></div>;
        }
      },
      {
        field: "current",
        headerName: "Current",
        width: 165,
        type: "numericColumn",
        valueFormatter: (p: any) =>
          p.data?.isTotal || p.data?.isSubtotal
            ? fmt(p.value)
            : p.value !== 0
            ? fmt(p.value)
            : "—",
        cellStyle: (p: any) => ({
          fontWeight: p.data?.isTotal ? "700" : p.data?.isSubtotal ? "600" : "500",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: p.data?.isTotal
            ? "#f4f4f5"
            : p.value < 0
            ? "#fb7185" // rose-400
            : "#e4e4e7", // zinc-200
          textAlign: "right",
        }),
      },
      {
        field: "previous",
        headerName: "Previous",
        width: 165,
        type: "numericColumn",
        valueFormatter: (p: any) =>
          p.data?.isTotal || p.data?.isSubtotal
            ? fmt(p.value)
            : p.value !== 0
            ? fmt(p.value)
            : "—",
        cellStyle: () => ({
          color: "#71717a",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          textAlign: "right",
        }),
      },
      {
        field: "absChange",
        headerName: "Δ Change",
        width: 165,
        type: "numericColumn",
        valueFormatter: (p: any) =>
          p.data?.isSubtotal || p.data?.isTotal
            ? fmtChange(p.value)
            : p.value === 0
            ? "—"
            : fmtChange(p.value),
        cellStyle: (p: any) => ({
          color:
            p.value > 0
              ? "#34d399"
              : p.value < 0
              ? "#fb7185"
              : "#52525b",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontWeight:
            p.data?.isTotal ? "700" : p.data?.isSubtotal ? "600" : "500",
          textAlign: "right",
        }),
      },
      {
        field: "pctChange",
        headerName: "Δ %",
        width: 105,
        type: "numericColumn",
        cellRenderer: PctChangeBadge,
        cellStyle: { textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end" },
      },
      {
        field: "impactScore",
        headerName: "Impact Score",
        width: 120,
        type: "numericColumn",
        sort: "desc",
        valueFormatter: (p: any) => p.value ? fmt(p.value) : "",
        cellStyle: (p: any) => ({
          color: p.value > 100000 ? "#f87171" : p.value > 10000 ? "#fbbf24" : "#a1a1aa",
          fontWeight: p.value > 50000 ? "bold" : "normal",
          textAlign: "right"
        }),
      },
      {
        field: "flags",
        headerName: "Flags / Notes",
        width: 120,
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams) =>
          FlagCell({ ...p, onNote, notes, highlightRisks } as any),
        cellStyle: { overflow: "visible" },
      },
      {
        headerName: "",
        width: 40,
        sortable: false,
        filter: false,
        cellRenderer: (p: any) => {
          if (p.data?.isTotal || p.data?.isSubtotal) return null;
          return (
            <button
              onClick={() => p.onExplain && p.onExplain()}
              className="w-full h-full flex items-center justify-center text-white/30 hover:text-indigo-400 hover:bg-indigo-400/10 transition-colors rounded"
              title="Explain this change"
            >
              <Sparkles size={14} />
            </button>
          );
        },
        cellRendererParams: (params: any) => ({
          onExplain: () => params.data?.account && handleExplain(params.data.account)
        })
      },
    ];
  }, [sectionFilter, notes, highlightRisks, handleExplain]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      floatingFilter: false,
    }),
    []
  );

  const getRowStyle = useCallback(
    (params: any): Record<string, string> | undefined => {
      const d = params.data;
      if (!d) return undefined;
      if (d.isTotal)
        return {
          background: "rgba(255,255,255,0.06)",
          fontWeight: "bold",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        };
      if (d.isSubtotal)
        return {
          background: "rgba(255,255,255,0.02)",
          fontWeight: "normal",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        };
      if (highlightRisks && d.flags?.includes("NEGATIVE_UNEXPECTED"))
        return { background: "rgba(239, 68, 68, 0.03)", fontWeight: "normal", borderTop: "" };
      if (highlightRisks && d.flags?.includes("LARGE_CHANGE"))
        return { background: "rgba(234, 179, 8, 0.02)", fontWeight: "normal", borderTop: "" };
      return undefined;
    },
    [highlightRisks]
  );

  const isBalanced = compareData?.currentTotals.balanced ?? true;
  const sections: Array<"ASSETS" | "LIABILITIES" | "EQUITY"> = [
    "ASSETS",
    "LIABILITIES",
    "EQUITY",
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── CFO Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/8 bg-[#0a0a0a] shrink-0 flex-wrap">
        {/* Balance integrity */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border shrink-0 ${
            isBalanced
              ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {isBalanced ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {isBalanced ? "Balanced" : "Imbalanced"}
        </div>

        {/* Risk indicator */}
        {riskCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-amber-500/8 border-amber-500/20 text-amber-400 shrink-0">
            <AlertCircle size={12} />
            {riskCount} flag{riskCount !== 1 ? "s" : ""}
          </div>
        )}

        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Comparison date picker */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-white/30 uppercase tracking-wider font-medium">
            vs.
          </span>
          <div className="flex items-center gap-1.5 bg-white/4 border border-white/8 rounded-lg px-2.5 py-1">
            <Calendar size={12} className="text-white/40" />
            <input
              type="date"
              value={prevDate}
              onChange={(e) => setPrevDate(e.target.value)}
              className="bg-transparent text-white/70 text-[12px] font-mono focus:outline-none"
            />
          </div>
        </div>

        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Section filter pills */}
        <div className="flex items-center gap-1 shrink-0">
          {(["ALL", ...sections] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSectionFilter(s as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                sectionFilter === s
                  ? "bg-white/12 text-white"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Toggles */}
        <button
          onClick={() => setShowChangesOnly((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all shrink-0 ${
            showChangesOnly
              ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
              : "border-white/8 text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          {showChangesOnly ? <Eye size={12} /> : <EyeOff size={12} />}
          Changes Only
        </button>

        <button
          onClick={() => setHighlightRisks((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all shrink-0 ${
            highlightRisks
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "border-white/8 text-white/40 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <AlertCircle size={12} />
          Risk Highlights
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export */}
        <button
          onClick={exportCSV}
          disabled={!compareData}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium border border-white/8 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-30 shrink-0"
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {/* ── CFO Insights Dashboard ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-5 shrink-0 bg-[#0a0a0a] border-b border-white/5">
        {/* Row 1: Alerts and Quick Stats */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {insightData.hasAnomaly && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold whitespace-nowrap shadow-[0_0_15px_rgba(244,63,94,0.1)] shrink-0">
              <MessageSquareWarning size={14} />
              Critical anomaly detected
            </div>
          )}
          {insightData.biggestIncrease && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 hover:bg-white/8 transition-colors border border-white/10 text-xs whitespace-nowrap shrink-0">
              <div className="text-emerald-400"><TrendingUp size={14}/><span className="sr-only">Trending Up</span></div>
              <span className="text-white/40 uppercase tracking-widest text-[9px] font-bold">Biggest Increase:</span>
              <span className="text-white/90 font-medium">{insightData.biggestIncrease?.account}</span>
              <span className="text-emerald-400 font-mono font-medium ml-1">+{fmtChange(insightData.biggestIncrease?.absChange || 0)}</span>
            </div>
          )}
          {insightData.biggestRisk && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 hover:bg-white/8 transition-colors border border-white/10 text-xs whitespace-nowrap shrink-0">
              <div className="text-amber-400"><AlertTriangle size={14}/><span className="sr-only">Alert</span></div>
              <span className="text-white/40 uppercase tracking-widest text-[9px] font-bold">Biggest Risk:</span>
              <span className="text-white/90 font-medium">{insightData.biggestRisk?.account}</span>
            </div>
          )}
          {insightData.stableArea && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 hover:bg-white/8 transition-colors border border-white/10 text-xs whitespace-nowrap shrink-0">
              <div className="text-blue-400"><Layers size={14}/><span className="sr-only">Layers</span></div>
              <span className="text-white/40 uppercase tracking-widest text-[9px] font-bold">Stable Area:</span>
              <span className="text-white/90 font-medium">{insightData.stableArea?.account}</span>
            </div>
          )}
        </div>

        {/* Row 2: Deep Dive Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Analysis Card */}
          <div className="xl:col-span-2 bg-[#121212] border border-white/5 p-4 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BrainCircuit size={14}/> Deep CFO Analysis
            </h3>
            <ul className="space-y-2 relative z-10">
              {insightData.insights.length > 0 ? insightData.insights.map((ins, i) => (
                <li key={i} className="text-[13px] text-white/70 leading-relaxed flex items-start gap-2.5 bg-white/2 hover:bg-white/4 px-3 py-2 rounded-lg transition-colors border border-white/5">
                  <span className="mt-0.5 text-[10px] text-indigo-400/50 shrink-0">✦</span>
                  {ins}
                </li>
              )) : <li className="text-[13px] text-white/40 italic px-2">Monitoring ledger for significant drifts...</li>}
            </ul>
          </div>
          
          {/* Top Movers Card */}
          <div className="col-span-1 bg-[#121212] border border-white/5 p-4 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
            <h3 className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap size={14}/> Top Movers
            </h3>
            <div className="space-y-2 mt-1 relative z-10">
              {insightData.topDrivers.length > 0 ? insightData.topDrivers.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[13px] hover:bg-white/4 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-white/5">
                  <span className="text-white/70 truncate mr-3 flex-1 font-medium">{r.account}</span>
                  <span className={`font-mono text-xs text-right whitespace-nowrap bg-[#0a0a0a] px-2 py-1 rounded border border-white/5 shadow-inner ${r.absChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {fmtChange(r.absChange)}
                  </span>
                </div>
              )) : <div className="text-[13px] text-white/40 italic px-2">No significant drivers detected</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid + Drill Panel ───────────────────────────────────────── */}
      <div className={`flex flex-1 overflow-hidden ${tableFullScreen ? 'fixed inset-0 z-100 bg-[#0a0a0a]' : ''}`}>
        {/* Main grid */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-xs text-white/30 font-mono">
                  Computing variance...
                </span>
              </div>
            </div>
          )}
          <AgGridReact
            ref={gridRef}
            theme={myTheme}
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            getRowStyle={getRowStyle}
            animateRows={true}
            suppressContextMenu={true}
            tooltipShowDelay={300}
          />
          
          <button
            onClick={() => setTableFullScreen(!tableFullScreen)}
            className="absolute top-3 right-5 z-20 bg-[#111]/80 backdrop-blur-sm border border-white/10 text-white/50 hover:text-white p-1.5 rounded-lg transition-colors shadow-lg"
            title={tableFullScreen ? "Exit Full Screen" : "Full Screen Table"}
          >
            {tableFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Legend */}
          {highlightRisks && (
            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-[#111]/80 backdrop-blur-sm border border-white/8 rounded-xl px-3 py-1.5 text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <span className="text-rose-400">
                  <AlertCircle size={10} />
                </span>
                Negative asset
              </span>
              <span className="flex items-center gap-1">
                <span className="text-amber-400">⚡</span>
                Change &gt;20%
              </span>
              <span className="flex items-center gap-1">
                <span className="text-blue-400">✦</span>
                New entry
              </span>
              <span className="flex items-center gap-1">
                <span className="text-violet-400">
                  <StickyNote size={10} />
                </span>
                Has note
              </span>
            </div>
          )}
        </div>

        {/* Drill-down panel */}
        {drillAccount && (
          <DrillPanel
            account={drillAccount}
            asOfDate={asOfDate}
            token={token}
            organizationId={organizationId}
            onClose={() => setDrillAccount(null)}
          />
        )}
      </div>

      {/* Note popover */}
      <NotePopover
        account={noteAccount}
        notes={notes}
        onSave={saveNote}
        onClose={() => setNoteAccount(null)}
      />

      {/* Explain Modal */}
      {explainModal.account && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-[#111111] border border-white/10 rounded-xl max-w-md w-full shadow-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                 <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles size={18} />
                    <h2 className="text-sm font-semibold text-white">Explain Change</h2>
                 </div>
                 <button onClick={() => setExplainModal({ account: null, text: "", loading: false })} className="text-white/40 hover:text-white transition-colors"><X size={16}/></button>
              </div>
              <div className="p-5">
                 <h3 className="text-xs text-white/40 uppercase tracking-widest mb-2 font-semibold">Account</h3>
                 <p className="text-sm font-medium text-white mb-4">{explainModal.account}</p>
                 
                 <h3 className="text-xs text-white/40 uppercase tracking-widest mb-2 font-semibold">Analysis</h3>
                 <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-4 min-h-[80px] flex items-center shadow-inner">
                    {explainModal.loading ? (
                       <div className="flex items-center gap-2 text-indigo-400/60 text-sm animate-pulse w-full justify-center py-2">
                          <BrainCircuit size={16} className="animate-pulse" /> Scanning historical ledger...
                       </div>
                    ) : (
                       <p className="text-[13px] text-white/80 leading-relaxed font-mono">{explainModal.text}</p>
                    )}
                 </div>
              </div>
              <div className="p-4 border-t border-white/5 flex justify-end bg-white/5">
                 <button onClick={() => setExplainModal({ account: null, text: "", loading: false })} className="px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">Dismiss</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Balance Sheet Page ──────────────────────────────────────────────────

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
  const [fullScreenPanel, setFullScreenPanel] = useState<
    "ledger" | "ai" | "cfo" | null
  >(null);

  const isLedgerFS = fullScreenPanel === "ledger";
  const isAiFS = fullScreenPanel === "ai";
  const isCfoFS = fullScreenPanel === "cfo";
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const organizationId = (user as any)?.organizationId as string | undefined;

  const fetchBS = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ asOfDate });
      if (organizationId) {
        qs.set("organizationId", organizationId);
      }
      const res = await api<{ status: string; data: BalanceSheetData }>(
        `/financials/balance-sheet?${qs}`,
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
      const qs = new URLSearchParams({ asOfDate });
      if (organizationId) {
        qs.set("organizationId", organizationId);
      }
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
        }/financials/balance-sheet/export?${qs}`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  // Sections for Modern view
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
                CFO Workbench
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

      {/* KPI Cards — Modern view only */}
      {data && !fullScreenPanel && viewMode === "modern" && (
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

      {/* CFO Workbench — full height */}
      {viewMode === "grid" && (!fullScreenPanel || fullScreenPanel === "cfo") && (
        <div className="flex-1 bg-[#0a0a0a] border border-white/6 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-white/2 shrink-0">
            <div className="flex items-center gap-2">
              <Table size={16} className="text-primary" />
              <span className="font-semibold text-foreground text-sm">
                CFO Workbench
              </span>
              <span className="text-[11px] text-white/30 bg-white/5 px-2 py-0.5 rounded-md font-mono">
                Period-over-Period Variance
              </span>
            </div>
            <button
              onClick={() =>
                setFullScreenPanel(isCfoFS ? null : "cfo")
              }
              className="text-foreground/50 hover:text-foreground p-1 transition-colors"
              title={isCfoFS ? "Exit Full Screen" : "Full Screen"}
            >
              {isCfoFS ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
            </button>
          </div>
          <div className="h-[calc(100%-44px)]">
            <CFOWorkbench
              asOfDate={asOfDate}
              token={token}
              organizationId={organizationId}
            />
          </div>
        </div>
      )}

      {/* Modern view */}
      {viewMode === "modern" && (
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
                <span className="font-semibold text-foreground">
                  Ledger View
                </span>
              </div>
              <button
                onClick={() =>
                  setFullScreenPanel(isLedgerFS ? null : "ledger")
                }
                className="text-foreground/50 hover:text-foreground p-1 transition-colors"
                title={isLedgerFS ? "Exit Full Screen" : "Full Screen"}
              >
                {isLedgerFS ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
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
                    No transactions found. Add transactions to generate a
                    Balance Sheet.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
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
                        <div
                          className={`flex items-center justify-between px-4 py-3 rounded-xl ${sectionBg} mb-3`}
                        >
                          <span
                            className={`font-bold text-sm uppercase tracking-wider ${sectionColor}`}
                          >
                            {section}
                          </span>
                        </div>

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
                <span className="font-semibold text-foreground">
                  AI Insights
                </span>
              </div>
              <div className="flex items-center gap-2">
                {analysis && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1">
                    <Activity size={12} /> Live
                  </span>
                )}
                <button
                  onClick={() =>
                    setFullScreenPanel(isAiFS ? null : "ai")
                  }
                  className="text-foreground/50 hover:text-foreground p-1 transition-colors"
                  title={isAiFS ? "Exit Full Screen" : "Full Screen"}
                >
                  {isAiFS ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
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
                disabled={
                  analyzing || loading || !data || data.rows.length === 0
                }
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
      )}
    </div>
  );
}
