"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Activity, Globe,
  RefreshCcw, Search, Download, Bookmark, Share2,
  ArrowUpRight, ArrowDownRight, Minus, Clock,
  Zap, AlertTriangle, Info, Sparkles, X, Building2, Loader2,
} from "lucide-react";
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ComposedChart, Line,
} from "recharts";
import {
  INDICES, NEWS_FEED, VC_ROUNDS, STOCK_WATCHLIST, MACRO_INDICATORS,
  ALPHA_SIGNALS, SECTOR_METRICS, CALENDAR_EVENTS, CHART_30D,
} from "./data";


// ─── Type Definitions ────────────────────────────────────────────────────────

type ActiveTab = "overview" | "sectors" | "venture" | "macro" | "news";
type TimeRange = "1D" | "1W" | "1M" | "3M" | "YTD";
type NewsSentiment = "All" | "Bullish" | "Bearish" | "Neutral";

// ─── AI Research Types ───────────────────────────────────────────────────────

interface AINewsItem {
  title: string;
  summary: string;
  source: string;
  sector: string;
  impact: string;
  sentiment: string;
}

interface AISignal {
  type: "Opportunity" | "Risk" | "Tailwind";
  title: string;
  rationale: string;
  confidence: number;
  timeHorizon: string;
  affectedSectors: string[];
  actionable: string;
}

interface AIMacroItem {
  name: string;
  value: string;
  delta: string;
  direction: "up" | "down" | "flat";
  impact: string;
}

interface AIResearchResult {
  news: AINewsItem[];
  alpha_signals: AISignal[];
  macro: AIMacroItem[];
  summary: string;
}

const RESEARCH_API = "/api/research"; // Server-side proxy — avoids browser CORS


// ─── Micro-Components ────────────────────────────────────────────────────────

function ChangeLabel({ val, pct, showPct = true, size = "sm" }: { val?: number; pct: number; showPct?: boolean; size?: "xs" | "sm" | "base" }) {
  const isPos = pct >= 0;
  const color = isPos ? "text-emerald-400" : "text-rose-400";
  const Icon = isPos ? ArrowUpRight : ArrowDownRight;
  const sizes = { xs: "text-[11px]", sm: "text-sm", base: "text-base" };
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium tabular-nums ${color} ${sizes[size]}`}>
      <Icon size={size === "xs" ? 12 : 14} />
      {val !== undefined && `${isPos ? "+" : ""}${val > 0 ? val.toFixed(2) : (val * -1).toFixed(2)}`}
      {showPct && <span className="opacity-80">{val !== undefined ? " (" : ""}{isPos ? "+" : ""}{pct.toFixed(2)}%{val !== undefined ? ")" : ""}</span>}
    </span>
  );
}

function ImpactPill({ impact }: { impact: string }) {
  const variants: Record<string, string> = {
    Critical: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    High:     "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Medium:   "bg-blue-500/15  text-blue-400  border-blue-500/25",
    Low:      "bg-zinc-500/10  text-zinc-400  border-zinc-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${variants[impact] ?? variants.Low}`}>
      {impact}
    </span>
  );
}

function SentimentPill({ sentiment }: { sentiment: string }) {
  const variants: Record<string, string> = {
    Bullish: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Bearish: "bg-rose-500/10   text-rose-400   border-rose-500/20",
    Neutral: "bg-sky-500/10    text-sky-400    border-sky-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${variants[sentiment] ?? variants.Neutral}`}>
      {sentiment}
    </span>
  );
}

function SignalIcon({ type }: { type: AISignal["type"] }) {
  if (type === "Opportunity") return <ArrowUpRight size={14} className="text-emerald-400" />;
  if (type === "Risk") return <AlertTriangle size={14} className="text-rose-400" />;
  return <Zap size={14} className="text-amber-400" />;
}

function MiniSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const h = 28, w = 72;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  const lastVal = data[data.length - 1];
  const firstVal = data[0];
  const color = lastVal >= firstVal ? "#10b981" : "#f43f5e";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Layout Component ────────────────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#0d0d0d] border border-zinc-800/60 rounded-xl overflow-hidden ${className}`}>{children}</div>;
}

function SectionHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800/60">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

function TableRow({ children, hover = true }: { children: React.ReactNode; hover?: boolean }) {
  return (
    <tr className={`border-b border-zinc-800/40 last:border-0 ${hover ? "hover:bg-white/[0.02] transition-colors" : ""}`}>
      {children}
    </tr>
  );
}

function TD({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3 text-sm text-zinc-300 ${className}`}>{children}</td>;
}

function TH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-zinc-900/50 ${className}`}>
      {children}
    </th>
  );
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

function OverviewTab() {
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const ranges: TimeRange[] = ["1D","1W","1M","3M","YTD"];
  return (
    <div className="flex flex-col gap-6">
      {/* Primary Chart */}
      <Section>
        <SectionHeader
          title="Market Momentum Index — Weighted Composite"
          sub="SPX / AI Sector / SaaS Sector — Normalized to 100"
          right={
            <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
              {ranges.map(r => (
                <button key={r} onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-all ${timeRange === r ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
                  {r}
                </button>
              ))}
            </div>
          }
        />
        <div className="p-5">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div><p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">S&P 500</p><p className="text-2xl font-bold text-zinc-100 tabular-nums">5,203.58</p><ChangeLabel val={38.42} pct={0.74} /></div>
            <div><p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">AI Sector Index</p><p className="text-2xl font-bold text-zinc-100 tabular-nums">142.4</p><ChangeLabel val={1.9} pct={1.35} /></div>
            <div><p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-1">SaaS Index</p><p className="text-2xl font-bold text-zinc-100 tabular-nums">108.2</p><ChangeLabel val={0.4} pct={0.37} /></div>
          </div>
          <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <ComposedChart data={CHART_30D} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} interval={4} />
                <YAxis yAxisId="spx" orientation="right" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} domain={['auto','auto']} />
                <YAxis yAxisId="idx" orientation="left" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={[85, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor:"#111", border:"1px solid #27272a", borderRadius:"8px", fontSize:"12px", boxShadow:"0 10px 25px rgba(0,0,0,0.5)" }} />
                <Area yAxisId="spx" type="monotone" dataKey="spx" stroke="#3b82f6" strokeWidth={2} fill="url(#spxGrad)" name="SPX" />
                <Line yAxisId="idx" type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="AI Idx" />
                <Line yAxisId="idx" type="monotone" dataKey="saas" stroke="#10b981" strokeWidth={1.5} dot={false} name="SaaS Idx" />
              </ComposedChart>
            </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-zinc-800/60">
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> S&P 500</span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" /> AI Sector</span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> SaaS Index</span>
          </div>
        </div>
      </Section>

      {/* Alpha Signals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ALPHA_SIGNALS.map(signal => (
          <Section key={signal.id}>
            <div className="p-5 flex flex-col gap-3 h-full">
              <div className="flex items-start justify-between">
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                  signal.type === "Opportunity" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  signal.type === "Risk"        ? "bg-rose-500/10   text-rose-400   border-rose-500/20" :
                                                  "bg-amber-500/10  text-amber-400  border-amber-500/20"
                }`}>
                  <SignalIcon type={signal.type} />{signal.type}
                </div>
                <span className="text-xs text-zinc-500">{signal.confidence}% conf.</span>
              </div>
              <p className="text-sm font-semibold text-zinc-100 leading-snug">{signal.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed flex-1">{signal.rationale}</p>
              <div className="pt-3 border-t border-zinc-800/60">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Actionable</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{signal.actionable}</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2">
                <span>Horizon: {signal.timeHorizon}</span>
                <span>{signal.affectedSectors.join(", ")}</span>
              </div>
            </div>
          </Section>
        ))}
      </div>

      {/* Sector Metrics Table */}
      <SectorTable />
    </div>
  );
}

// ─── Sector Table ────────────────────────────────────────────────────────────

function SectorTable() {
  return (
    <Section>
      <SectionHeader title="Sub-Sector Performance Matrix" sub="YTD returns, VC activity and forward multiple benchmarks" />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <TH>Sector</TH>
              <TH className="text-right">YTD Return</TH>
              <TH className="text-center">Momentum</TH>
              <TH className="text-center">VC Activity</TH>
              <TH className="text-right">Fwd Multiple</TH>
              <TH>Top Risk</TH>
              <TH className="text-right">30-Day</TH>
            </tr>
          </thead>
          <tbody>
            {SECTOR_METRICS.map(s => (
              <TableRow key={s.sector}>
                <TD><span className="font-medium text-zinc-200">{s.sector}</span></TD>
                <TD className="text-right"><ChangeLabel pct={s.ytd} size="xs" /></TD>
                <TD className="text-center">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.momentum > 75 ? "bg-emerald-500" : s.momentum > 55 ? "bg-blue-500" : s.momentum > 35 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${s.momentum}%` }} />
                    </div>
                    <span className="text-[11px] text-zinc-400 w-6 tabular-nums">{s.momentum}</span>
                  </div>
                </TD>
                <TD className="text-center">
                  <span className={`text-[11px] font-medium ${s.vcActivity === "Very High" ? "text-emerald-400" : s.vcActivity === "High" ? "text-blue-400" : s.vcActivity === "Moderate" ? "text-amber-400" : "text-zinc-500"}`}>
                    {s.vcActivity}
                  </span>
                </TD>
                <TD className="text-right"><span className="text-xs font-mono text-zinc-300">{s.avgMultiple}</span></TD>
                <TD><span className="text-xs text-zinc-500">{s.topRisk}</span></TD>
                <TD className="text-right"><MiniSparkline data={s.sparkline} /></TD>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// ─── Tab: News ────────────────────────────────────────────────────────────────

function NewsTab() {
  const [sentiment, setSentiment] = useState<NewsSentiment>("All");
  const [search, setSearch] = useState("");
  const sentiments: NewsSentiment[] = ["All", "Bullish", "Bearish", "Neutral"];
  const filtered = useMemo(() => NEWS_FEED.filter(n => {
    const matchSent = sentiment === "All" || n.sentiment === sentiment;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.sector.toLowerCase().includes(search.toLowerCase());
    return matchSent && matchSearch;
  }), [sentiment, search]);

  return (
    <Section>
      <SectionHeader
        title="Strategic Intelligence Feed"
        sub={`${filtered.length} articles — Curated for founders & operators`}
        right={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-zinc-600 w-44" />
            </div>
            <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
              {sentiments.map(s => (
                <button key={s} onClick={() => setSentiment(s)} className={`px-2.5 py-1 text-xs rounded-[4px] font-medium transition-all ${sentiment === s ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>{s}</button>
              ))}
            </div>
          </div>
        }
      />
      <div>
        {filtered.map((item, idx) => (
          <div key={item.id} className={`px-5 py-5 hover:bg-zinc-900/30 transition-colors group cursor-pointer ${idx !== filtered.length - 1 ? "border-b border-zinc-800/50" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-zinc-400">{item.source}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-600">{item.author}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="flex items-center gap-1 text-xs text-zinc-600"><Clock size={11}/>{item.time}</span>
                  <span className="text-zinc-700">·</span>
                  <span className="text-xs text-zinc-600">{item.readTime} read</span>
                </div>
                <h4 className="text-base font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors mb-2 leading-snug">{item.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">{item.summary}</p>
                <div className="flex items-center gap-3">
                  <ImpactPill impact={item.impact} />
                  <SentimentPill sentiment={item.sentiment} />
                  <span className="text-[10px] text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded uppercase font-medium">{item.sector}</span>
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-zinc-600">Relevance: <span className={`font-bold ${item.relevance >= 9 ? "text-emerald-400" : "text-zinc-400"}`}>{item.relevance}/10</span></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors" title="Bookmark"><Bookmark size={15}/></button>
                <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors" title="Share"><Share2 size={15}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Tab: Venture ─────────────────────────────────────────────────────────────

function VentureTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* VC Activity Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Q1 2024 Capital Deployed", value: "$74.1B", delta: "+8.8% QoQ", up: true },
          { label: "Median Seed Valuation", value: "$15.5M", delta: "Stable", up: null },
          { label: "Series A Conversions", value: "18.2%", delta: "-2.1pp YoY", up: false },
          { label: "Time to Series A", value: "22 months", delta: "+4 months YoY", up: false },
        ].map(card => (
          <Section key={card.label}>
            <div className="p-4">
              <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-2">{card.label}</p>
              <p className="text-xl font-bold text-zinc-100 tabular-nums mb-1">{card.value}</p>
              <p className={`text-xs ${card.up === true ? "text-emerald-400" : card.up === false ? "text-rose-400" : "text-zinc-500"}`}>{card.delta}</p>
            </div>
          </Section>
        ))}
      </div>

      {/* Recent Funding Rounds */}
      <Section>
        <SectionHeader title="Recent Funding Rounds" sub="Selected high-signal deals — last 30 days" right={<button className="text-xs text-blue-400 hover:underline">View full database →</button>} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TH>Company</TH>
                <TH>Sector</TH>
                <TH>Stage</TH>
                <TH className="text-right">Amount</TH>
                <TH className="text-right">Valuation</TH>
                <TH>Lead Investor</TH>
                <TH className="text-center">Country</TH>
                <TH className="text-right">Date</TH>
              </tr>
            </thead>
            <tbody>
              {VC_ROUNDS.map(r => (
                <TableRow key={r.company}>
                  <TD><span className="font-semibold text-zinc-200">{r.company}</span></TD>
                  <TD><span className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">{r.sector}</span></TD>
                  <TD><span className="text-[11px] font-medium text-blue-400">{r.stage}</span></TD>
                  <TD className="text-right font-mono font-semibold text-zinc-200">{r.amount}</TD>
                  <TD className="text-right font-mono text-zinc-400">{r.valuation}</TD>
                  <TD><span className="text-xs text-zinc-400">{r.lead}</span></TD>
                  <TD className="text-center"><span className="text-xs font-mono text-zinc-500">{r.country}</span></TD>
                  <TD className="text-right"><span className="text-xs text-zinc-500">{r.date}</span></TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* VC Firm Sentiment */}
      <Section>
        <SectionHeader title="VC Firm Sentiment & Focus Areas" sub="Proprietary scoring from public statements, portfolio activity and LP updates" />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { firm: "Sequoia Capital",       score: 78, thesis: "AI agents and enterprise security. Cautious on consumer. Focus on capital efficiency and GT convergence.", focus: ["AI Agents","Security","Enterprise"], activity: "Active" },
            { firm: "Andreessen Horowitz",   score: 82, thesis: "Crypto infrastructure, bio/health, and AI-native startups. Recently closed $7B across 3 new funds.", focus: ["Crypto","Bio","AI-Native"], activity: "Very Active" },
            { firm: "Benchmark",             score: 65, thesis: "Open-source monetization and developer-led growth. Reduced check size; fewer leads per year.", focus: ["Dev Tools","OSS","SaaS"], activity: "Selective" },
            { firm: "Lightspeed Venture",    score: 71, thesis: "Enterprise fintech, climate infrastructure, and Southeast Asia expansion. Cross-border GTM expertise.", focus: ["Fintech","Climate","SEA"], activity: "Active" },
            { firm: "General Catalyst",      score: 76, thesis: "Health assurance and responsible AI. Long-term societal impact lens with global scale ambition.", focus: ["Health","AI","GlobalScale"], activity: "Active" },
            { firm: "Coatue Management",     score: 88, thesis: "AI infrastructure bets — GPU cloud, model serving. Concentrated at growth and pre-IPO. High conviction.", focus: ["AI Infra","MLOps","Pre-IPO"], activity: "Very Active" },
          ].map(vc => (
            <div key={vc.firm} className="flex flex-col gap-3 p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{vc.firm}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${vc.activity === "Very Active" ? "text-emerald-400" : vc.activity === "Active" ? "text-blue-400" : "text-amber-400"}`}>{vc.activity}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-zinc-100">{vc.score}<span className="text-xs text-zinc-600">/100</span></div>
                  <div className="text-[10px] text-zinc-600 uppercase font-semibold tracking-wider">Sentiment</div>
                </div>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${vc.score > 80 ? "bg-emerald-500" : vc.score > 65 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${vc.score}%` }}/>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{vc.thesis}</p>
              <div className="flex flex-wrap gap-1.5">
                {vc.focus.map(f => <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium">{f}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Tab: Macro ───────────────────────────────────────────────────────────────

function MacroTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Macro Indicators Table */}
        <Section>
          <SectionHeader title="Global Macro Indicators" sub="Real-time economic signals and founder impact analysis" />
          <div className="overflow-hidden">
            {MACRO_INDICATORS.map((m, idx) => (
              <div key={m.name} className={`flex items-start gap-4 px-5 py-4 ${idx !== MACRO_INDICATORS.length - 1 ? "border-b border-zinc-800/50" : ""}`}>
                <div className={`mt-0.5 shrink-0 ${m.direction === "up" ? "text-emerald-400" : m.direction === "down" ? "text-rose-400" : "text-zinc-500"}`}>
                  {m.direction === "up" ? <TrendingUp size={16}/> : m.direction === "down" ? <TrendingDown size={16}/> : <Minus size={16}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{m.name}</p>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${m.direction === "up" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : m.direction === "down" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>{m.delta}</span>
                  </div>
                  <p className="text-lg font-bold text-zinc-100 tabular-nums">{m.value} <span className="text-xs text-zinc-600 font-normal">prev: {m.prev}</span></p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1">{m.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Events Calendar */}
        <Section>
          <SectionHeader title="Forward Event Calendar" sub="High-impact events for planning your fundraising and release cycles" />
          <div className="p-5 space-y-3">
            {CALENDAR_EVENTS.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                <div className="shrink-0 text-center w-14">
                  <p className="text-[10px] text-zinc-600 font-semibold uppercase">{ev.date.split(" ")[0]}</p>
                  <p className="text-xl font-bold text-zinc-200 leading-none">{ev.date.split(" ")[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{ev.title}</p>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border inline-block mt-1 ${
                    ev.type === "Fed" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    ev.type === "Earnings" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>{ev.type}</span>
                </div>
                <ImpactPill impact={ev.impact} />
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Volume/Deployment Chart */}
      <Section>
        <SectionHeader title="Global VC Deployment — Quarterly Trend" sub="Capital deployed across all stages ($B), 2022–2024" />
        <div className="p-5">
          <ResponsiveContainer width="100%" height={220} minHeight={220}>
              <BarChart data={[
                { q: "Q1'22", deploy: 160, yoy: 12 }, { q: "Q2'22", deploy: 140, yoy: -2 },
                { q: "Q3'22", deploy: 110, yoy: -18 }, { q: "Q4'22", deploy: 85, yoy: -28 },
                { q: "Q1'23", deploy: 72, yoy: -55 }, { q: "Q2'23", deploy: 68, yoy: -51 },
                { q: "Q3'23", deploy: 74, yoy: -33 }, { q: "Q4'23", deploy: 76, yoy: -11 },
                { q: "Q1'24", deploy: 74, yoy: 3 },
              ]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="q" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}B`} />
                <Tooltip contentStyle={{ backgroundColor:"#111", border:"1px solid #27272a", borderRadius:"8px", fontSize:"12px" }} formatter={(v: number | undefined) => v !== undefined ? `$${v}B` : ""} />
                <Bar dataKey="deploy" fill="#3b82f6" radius={[4,4,0,0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          <p className="text-xs text-zinc-600 mt-3 leading-relaxed">Deployment recovered modestly in Q1 2024 — driven by AI infrastructure mega-rounds. Seed/Series A activity remains subdued. Overall market remains 50-55% below 2021 peak.</p>
        </div>
      </Section>
    </div>
  );
}

// ─── Tab: Sectors + Stocks ────────────────────────────────────────────────────

function SectorsTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stock Table */}
      <Section>
        <SectionHeader title="Public Comps — Watchlist" sub="Key SaaS, AI, and tech-adjacent public companies. EV/NTM Revenue benchmarks." right={<button className="text-xs text-zinc-500 flex items-center gap-1 hover:text-zinc-300 transition-colors"><Download size={13}/> Export CSV</button>} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <TH>Ticker</TH>
                <TH>Company</TH>
                <TH className="text-right">Price</TH>
                <TH className="text-right">Change</TH>
                <TH className="text-right">% Chg</TH>
                <TH className="text-right">Mkt Cap</TH>
                <TH className="text-right">EV/Rev</TH>
                <TH>Sector</TH>
                <TH className="text-center">Signal</TH>
              </tr>
            </thead>
            <tbody>
              {STOCK_WATCHLIST.map(s => (
                <TableRow key={s.symbol}>
                  <TD><span className="font-bold font-mono text-zinc-200">{s.symbol}</span></TD>
                  <TD><span className="text-sm text-zinc-300">{s.name}</span></TD>
                  <TD className="text-right font-mono text-zinc-200">${s.price.toFixed(2)}</TD>
                  <TD className="text-right"><ChangeLabel val={s.change} pct={s.pct} showPct={false} size="xs" /></TD>
                  <TD className="text-right"><ChangeLabel pct={s.pct} showPct={true} size="xs" /></TD>
                  <TD className="text-right font-mono text-zinc-400 text-xs">{s.mktCap}</TD>
                  <TD className="text-right font-mono text-zinc-300 text-xs">{s.ev_revenue}</TD>
                  <TD><span className="text-xs text-zinc-500">{s.sector}</span></TD>
                  <TD className="text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      s.signal === "Buy"     ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      s.signal === "Watch"   ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                               "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>{s.signal}</span>
                  </TD>
                </TableRow>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-800/60 flex items-center gap-2 text-[11px] text-zinc-600">
          <Info size={12}/> Signals are based on public market momentum, NTM estimates, and rule-of-40 benchmarks. Not financial advice.
        </div>
      </Section>
      <SectorTable />
    </div>
  );
}

// ─── Top Ticker Bar ───────────────────────────────────────────────────────────

function TickerBar() {
  return (
    <div className="h-10 border-b border-zinc-800/60 bg-zinc-950 flex items-center overflow-hidden px-4 relative">
      <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 mr-4 pr-4 border-r border-zinc-800">
        <Activity size={12} className="text-emerald-400" /> LIVE
      </div>
      <div className="flex items-center gap-8 animate-ticker whitespace-nowrap text-xs">
        {[...INDICES, ...INDICES].map((idx, i) => (
          <span key={`${idx.symbol}-${i}`} className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">{idx.symbol}</span>
            <span className="text-zinc-300 tabular-nums">{idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={idx.pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {idx.pct >= 0 ? "+" : ""}{idx.pct.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Export ─────────────────────────────────────────────────────────

const TABS: { key: ActiveTab; label: string }[] = [
  { key: "overview",  label: "Overview" },
  { key: "news",      label: "Intelligence Feed" },
  { key: "venture",   label: "Venture & VC" },
  { key: "sectors",   label: "Sectors & Stocks" },
  { key: "macro",     label: "Macro & Events" },
];

// ─── Company Research Dialog ─────────────────────────────────────────────────

function CompanyResearchDialog({ onClose, onResult }: { onClose: () => void; onResult: (r: AIResearchResult) => void }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(RESEARCH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_description: description }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Research failed (${res.status})`);
      }
      const data: AIResearchResult = await res.json();
      // Confirm at least one section has data
      if (!data.news?.length && !data.alpha_signals?.length && !data.macro?.length && !data.summary) {
        throw new Error("The research engine returned an empty response. Check your n8n workflow.");
      }
      onResult(data);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection failed. Is n8n running on port 5678?");
    } finally {
      setLoading(false);
    }
  }, [description, onClose, onResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-zinc-700/60 rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2"><Sparkles size={16} className="text-blue-400" /> AI Market Research</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Describe your company and get tailored market intelligence.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Company Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. We are a B2B SaaS fintech company building automated accounts payable software for mid-market businesses in India. We process $500M in invoices annually..."
              rows={5}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600/60 focus:ring-1 focus:ring-blue-600/30 resize-none transition-all"
            />
            <p className="text-[11px] text-zinc-600 mt-1.5">The more specific you are about your sector, stage, and target market, the better the intelligence output.</p>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-zinc-600 flex items-center gap-1.5"><Building2 size={12} /> Powered by your n8n research pipeline</p>
            <button
              onClick={handleSearch}
              disabled={loading || !description.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-900/30"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Researching...</> : <><Sparkles size={15} /> Start Research</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Research Results Section ─────────────────────────────────────────────

function AIResultsSection({ data, onClear }: { data: AIResearchResult; onClear: () => void }) {
  return (
    <div className="mb-8 space-y-6">
      {/* Summary Banner */}
      <div className="bg-blue-950/30 border border-blue-700/30 rounded-xl p-5 flex items-start gap-4">
        <div className="p-2 bg-blue-600/20 rounded-lg shrink-0 mt-0.5"><Sparkles size={16} className="text-blue-400" /></div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Research Summary</p>
            <button onClick={onClear} className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors"><X size={12} /> Clear Results</button>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Signals + Macro Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alpha Signals */}
        {data.alpha_signals?.length > 0 && (
          <Section>
            <SectionHeader title="AI Alpha Signals" sub={`${data.alpha_signals.length} signals from your research query`} />
            <div className="divide-y divide-zinc-800/50">
              {data.alpha_signals.map((sig, i) => (
                <div key={i} className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      sig.type === "Opportunity" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      sig.type === "Risk"        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                  "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>{sig.type}</span>
                    <span className="text-xs text-zinc-500">{sig.confidence}% confidence · {sig.timeHorizon}</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200">{sig.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{sig.rationale}</p>
                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Action</p>
                    <p className="text-xs text-zinc-300">{sig.actionable}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sig.affectedSectors?.map(s => <span key={s} className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Macro */}
        {data.macro?.length > 0 && (
          <Section>
            <SectionHeader title="AI Macro Indicators" sub="Macro context relevant to your company" />
            <div className="divide-y divide-zinc-800/50">
              {data.macro.map((m, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4">
                  <div className={`mt-0.5 shrink-0 ${ m.direction === "up" ? "text-emerald-400" : m.direction === "down" ? "text-rose-400" : "text-zinc-500" }`}>
                    {m.direction === "up" ? <TrendingUp size={15}/> : m.direction === "down" ? <TrendingDown size={15}/> : <Minus size={15}/>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{m.name}</p>
                    <p className="text-lg font-bold text-zinc-100 tabular-nums">{m.value} <span className={`text-sm font-medium ${ m.direction === "up" ? "text-emerald-400" : m.direction === "down" ? "text-rose-400" : "text-zinc-500" }`}>{m.delta}</span></p>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{m.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* AI News Grid */}
      {data.news?.length > 0 && (
        <Section>
          <SectionHeader title="Curated News for Your Company" sub={`${data.news.length} articles matched to your business context`} />
          <div className="divide-y divide-zinc-800/50">
            {data.news.map((item, i) => (
              <div key={i} className="px-5 py-4 hover:bg-zinc-900/30 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">{item.source}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[10px] border border-zinc-800 bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 uppercase">{item.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImpactPill impact={item.impact} />
                    <SentimentPill sentiment={item.sentiment} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-zinc-200 mb-1">{item.title}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

export default function MarketIntelligencePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [showDialog, setShowDialog] = useState(false);
  const [aiResults, setAiResults] = useState<AIResearchResult | null>(null);

  const content = useMemo(() => {
    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "news":     return <NewsTab />;
      case "venture":  return <VentureTab />;
      case "sectors":  return <SectorsTab />;
      case "macro":    return <MacroTab />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-200 selection:bg-blue-500/30">
      <TickerBar />

      <div className="max-w-[1600px] mx-auto px-6 pb-16">
        {/* Page Header */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/60">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-600 mb-2 font-medium uppercase tracking-widest">
              <Globe size={12} /> Market Intelligence Platform
            </div>
            <h1 className="text-xl font-bold text-zinc-100">Founder&apos;s Market Briefing</h1>
            <p className="text-sm text-zinc-500 mt-1">Real-time analysis of market conditions, sector dynamics, and strategic intelligence for operators.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 flex items-center gap-1.5"><RefreshCcw size={12}/> April 4, 2026 — IST 06:42</span>
            <button
              onClick={() => setShowDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-900/20"
            >
              <Sparkles size={14} /> Research My Company
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all">
              <Download size={14}/> Export Report
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-0.5 pt-1 pb-0 border-b border-zinc-800/60 mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.key ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t" />}
            </button>
          ))}
        </div>

        {/* AI Results — shown above tabs when available */}
        {aiResults && <AIResultsSection data={aiResults} onClear={() => setAiResults(null)} />}

        {/* Tab Content */}
        {content}
      </div>

      {/* Company Research Dialog */}
      {showDialog && (
        <CompanyResearchDialog
          onClose={() => setShowDialog(false)}
          onResult={(r) => { setAiResults(r); setShowDialog(false); }}
        />
      )}

      <style jsx global>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 35s linear infinite;
          display: flex;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
