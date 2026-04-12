// ─── Market Intelligence Data Layer ─────────────────────────────────────────
// All mock data for the Market Analysis Dashboard

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  pct: number;
  weekHigh: number;
  weekLow: number;
}

export interface NewsItem {
  id: string;
  source: string;
  author: string;
  title: string;
  summary: string;
  sector: string;
  tags: string[];
  time: string;
  readTime: string;
  impact: "Critical" | "High" | "Medium" | "Low";
  sentiment: "Bullish" | "Bearish" | "Neutral";
  relevance: number; // 1–10, how relevant to a SaaS/startup founder
}

export interface VCRound {
  company: string;
  sector: string;
  stage: string;
  amount: string;
  lead: string;
  date: string;
  valuation: string;
  country: string;
}

export interface StockWatchItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  pct: number;
  mktCap: string;
  ev_revenue: string;
  sector: string;
  signal: "Buy" | "Watch" | "Caution";
}

export interface MacroIndicator {
  name: string;
  value: string;
  prev: string;
  delta: string;
  direction: "up" | "down" | "flat";
  impact: string;
}

export interface AlphaSignal {
  id: string;
  type: "Opportunity" | "Risk" | "Tailwind";
  title: string;
  rationale: string;
  confidence: number; // %
  timeHorizon: string;
  affectedSectors: string[];
  actionable: string;
}

export interface SectorMetric {
  sector: string;
  ytd: number;
  momentum: number; // 0–100
  vcActivity: "Very High" | "High" | "Moderate" | "Low";
  avgMultiple: string;
  topRisk: string;
  sparkline: number[];
}

export interface CalendarEvent {
  date: string;
  title: string;
  type: "Fed" | "Earnings" | "Congress" | "Economic" | "Industry";
  impact: "High" | "Medium" | "Low";
}

// ── Indices ─────────────────────────────────────────────────────────────

export const INDICES: MarketIndex[] = [
  { symbol: "SPX",  name: "S&P 500",       value: 5203.58, change: 38.42,  pct:  0.74, weekHigh: 5264.85, weekLow: 5120.78 },
  { symbol: "NDX",  name: "Nasdaq 100",     value: 18124.4, change: 221.3,  pct:  1.24, weekHigh: 18330.1, weekLow: 17880.3 },
  { symbol: "RUT",  name: "Russell 2000",   value: 2040.32, change: -12.14, pct: -0.59, weekHigh: 2080.1,  weekLow: 2010.4  },
  { symbol: "VIX",  name: "CBOE VIX",       value: 13.22,   change: -0.48,  pct: -3.51, weekHigh: 16.40,   weekLow: 12.98   },
  { symbol: "DXY",  name: "USD Index",      value: 104.32,  change: 0.12,   pct:  0.11, weekHigh: 105.10,  weekLow: 103.80  },
  { symbol: "TNX",  name: "10-Yr Yield",    value: 4.22,    change: 0.04,   pct:  0.96, weekHigh: 4.34,    weekLow: 4.14    },
  { symbol: "BTC",  name: "Bitcoin",        value: 68420,   change: 1240,   pct:  1.85, weekHigh: 71200,   weekLow: 65900   },
  { symbol: "XAU",  name: "Gold Spot",      value: 2342.10, change: 18.4,   pct:  0.79, weekHigh: 2390.2,  weekLow: 2280.5  },
];

// ── News Feed ────────────────────────────────────────────────────────────

export const NEWS_FEED: NewsItem[] = [
  {
    id: "n01",
    source: "Bloomberg",
    author: "Olivia Carver",
    title: "SaaS Multiples Settle at 5.4x NTM Revenue — Selective Expansion Rewarded",
    summary: "Public SaaS median EV/NTM revenue at 5.4x, down from peak 18x in 2021. Investors now reward Rule of 40+ companies. Private market valuations following suit at 6–8x for best performers.",
    sector: "SaaS",
    tags: ["Valuations", "Public Comps", "Multiples"],
    time: "08:42",
    readTime: "4 min",
    impact: "Critical",
    sentiment: "Neutral",
    relevance: 10,
  },
  {
    id: "n02",
    source: "WSJ",
    author: "James Park",
    title: "AI Infrastructure Capex Outpacing Application Revenue by 5-Year Wide Margin",
    summary: "Microsoft, Google and Amazon combined capex for AI infrastructure projected at $214B in 2024. Downstream application monetization is still nascent — creating both risk and opportunity for application-layer startups.",
    sector: "AI/ML",
    tags: ["AI", "Infrastructure", "Capex"],
    time: "07:15",
    readTime: "6 min",
    impact: "High",
    sentiment: "Bullish",
    relevance: 9,
  },
  {
    id: "n03",
    source: "Reuters",
    author: "Sophie Mueller",
    title: "RBI Tightens BaaS Compliance Guidelines — Fintech Embedded Finance Under Scrutiny",
    summary: "New circular mandates direct liability for BaaS providers. Fintech startups using third-party banking rails face mandatory audit cycles. Implementation window: Q4 2024.",
    sector: "Fintech",
    tags: ["Regulation", "BaaS", "Compliance"],
    time: "06:50",
    readTime: "5 min",
    impact: "Critical",
    sentiment: "Bearish",
    relevance: 8,
  },
  {
    id: "n04",
    source: "TechCrunch",
    author: "Maria Gonzalez",
    title: "Seed-Stage AI Deals Hold at $15–20M Post-Money Despite Late-Stage Crunch",
    summary: "Pre-seed and seed cohorts in AI, vertical SaaS, and defense tech remain robust. Top-decile founders still commanding high valuations but bar has risen — B2B revenue traction now expected at Series A.",
    sector: "Venture",
    tags: ["Seed Funding", "Valuations", "AI"],
    time: "05:30",
    readTime: "3 min",
    impact: "High",
    sentiment: "Bullish",
    relevance: 10,
  },
  {
    id: "n05",
    source: "Financial Times",
    author: "David Osei",
    title: "Private Credit Fills Mid-Market Void as Banking Appetite Stays Subdued",
    summary: "Apollo, Ares and Blackstone's direct lending books exceed $150B combined. Middle-market corporate credit spreads 500–700bps over SOFR. Founders seeking venture debt should expect tighter covenants.",
    sector: "Macro",
    tags: ["Credit", "Private Markets", "Debt"],
    time: "04:00",
    readTime: "4 min",
    impact: "Medium",
    sentiment: "Neutral",
    relevance: 7,
  },
  {
    id: "n06",
    source: "Stratechery",
    author: "Ben Thompson",
    title: "The Aggregation Theory and AI: Why Middleware Startups Face Platform Risk",
    summary: "As OpenAI, Anthropic and Google build out capabilities, purely API-wrapped startups face margin compression. Winners will be those embedding AI into defensible workflows with switching costs.",
    sector: "AI/ML",
    tags: ["Platform Risk", "Strategy", "AI"],
    time: "Yesterday",
    readTime: "8 min",
    impact: "High",
    sentiment: "Bearish",
    relevance: 9,
  },
  {
    id: "n07",
    source: "Crunchbase News",
    author: "Sarah Chen",
    title: "Cybersecurity Funding Up 24% YoY — Identity and Zero Trust Lead Raise Activity",
    summary: "Identity governance, privileged access management and SASE vendors seeing strong investor demand. $4.2B invested in cybersecurity Q1 2024 globally, with US accounting for 62% of deal value.",
    sector: "Cybersecurity",
    tags: ["Security", "Funding", "Identity"],
    time: "Yesterday",
    readTime: "4 min",
    impact: "Medium",
    sentiment: "Bullish",
    relevance: 8,
  },
];

// ── VC Funding Rounds ────────────────────────────────────────────────────

export const VC_ROUNDS: VCRound[] = [
  { company: "CoreWeave",     sector: "AI Infra",     stage: "Series C",  amount: "$1.1B",  lead: "Coatue",          date: "Apr 2",  valuation: "$19B",   country: "US" },
  { company: "Wayve",         sector: "Autonomous",   stage: "Series B",  amount: "$1.05B", lead: "SoftBank",        date: "Apr 1",  valuation: "$5B",    country: "UK" },
  { company: "xAI",           sector: "AI/ML",        stage: "Series C",  amount: "$6B",    lead: "Andreessen",      date: "Mar 27", valuation: "$24B",   country: "US" },
  { company: "Glean",         sector: "Enterprise",   stage: "Series E",  amount: "$200M",  lead: "Kleiner Perkins", date: "Mar 26", valuation: "$2.2B",  country: "US" },
  { company: "Meesho",        sector: "E-Commerce",   stage: "Pre-IPO",   amount: "$275M",  lead: "Fidelity",        date: "Mar 25", valuation: "$4.9B",  country: "IN" },
  { company: "ElevenLabs",    sector: "AI Audio",     stage: "Series B",  amount: "$80M",   lead: "Andreessen",      date: "Mar 22", valuation: "$1.1B",  country: "US" },
  { company: "Turnitin",      sector: "EdTech",       stage: "Growth",    amount: "$150M",  lead: "General Atlantic", date: "Mar 20", valuation: "$1.75B", country: "US" },
  { company: "Navan",         sector: "Fintech",      stage: "Series H",  amount: "$100M",  lead: "Internal",        date: "Mar 18", valuation: "$9.2B",  country: "US" },
];

// ── Stock Watchlist ───────────────────────────────────────────────────────

export const STOCK_WATCHLIST: StockWatchItem[] = [
  { symbol: "CRWD", name: "CrowdStrike",  price: 316.42, change:  5.14, pct:  1.65, mktCap: "$79B",  ev_revenue: "17.2x", sector: "Security",   signal: "Buy"     },
  { symbol: "DDOG", name: "Datadog",      price: 126.80, change:  3.22, pct:  2.60, mktCap: "$41B",  ev_revenue: "12.8x", sector: "Observ.",    signal: "Buy"     },
  { symbol: "SNOW", name: "Snowflake",    price: 168.20, change: -3.40, pct: -1.98, mktCap: "$57B",  ev_revenue: "10.4x", sector: "Data",       signal: "Watch"   },
  { symbol: "MDB",  name: "MongoDB",      price: 388.60, change:  1.80, pct:  0.47, mktCap: "$28B",  ev_revenue: "12.1x", sector: "Database",   signal: "Buy"     },
  { symbol: "GTLB", name: "GitLab",       price: 62.40,  change: -0.80, pct: -1.27, mktCap: "$10.2B",ev_revenue: "8.4x",  sector: "DevOps",     signal: "Watch"   },
  { symbol: "HCP",  name: "HashiCorp",    price: 35.10,  change:  0.10, pct:  0.28, mktCap: "$6.8B", ev_revenue: "7.2x",  sector: "DevOps",     signal: "Watch"   },
  { symbol: "PLTR", name: "Palantir",     price: 24.85,  change:  0.35, pct:  1.43, mktCap: "$53B",  ev_revenue: "18.0x", sector: "AI/Gov",     signal: "Caution" },
  { symbol: "NET",  name: "Cloudflare",   price: 84.20,  change:  2.10, pct:  2.56, mktCap: "$28B",  ev_revenue: "14.6x", sector: "Network",    signal: "Buy"     },
];

// ── Macro Indicators ─────────────────────────────────────────────────────

export const MACRO_INDICATORS: MacroIndicator[] = [
  { name: "US Fed Funds Rate",     value: "5.25–5.50%", prev: "5.25–5.50%", delta: "Unchanged", direction: "flat", impact: "High borrowing costs pressure growth-stage capex" },
  { name: "US CPI (YoY)",          value: "3.2%",       prev: "3.4%",       delta: "-0.2pp",    direction: "down", impact: "Easing inflation extends rate-cut expectations" },
  { name: "US PCE Core (YoY)",     value: "2.8%",       prev: "2.9%",       delta: "-0.1pp",    direction: "down", impact: "Consumer spending remains resilient at margin" },
  { name: "ISM Manufacturing PMI", value: "50.3",       prev: "47.8",       delta: "+2.5",      direction: "up",   impact: "Manufacturing expansion signals broader recovery" },
  { name: "Global VC Deploy ($B)", value: "$74B",       prev: "$68B",       delta: "+8.8%",     direction: "up",   impact: "Q1 2024 sees recovery from 2023 trough" },
  { name: "US 30-Yr Mortgage",     value: "6.82%",      prev: "6.94%",      delta: "-0.12%",    direction: "down", impact: "Slight easing; proptech sentiment improving" },
];

// ── Alpha Signals ──────────────────────────────────────────────────────────

export const ALPHA_SIGNALS: AlphaSignal[] = [
  {
    id: "a01",
    type: "Opportunity",
    title: "Enterprise AI Budget Unlock Underway",
    rationale: "Gartner projects 40% of enterprise CIOs to pilot GenAI POCs in 2024. Early contract wins in HR automation, code generation, and legal review are converting to production. Workflow-embedded plays have lower churn risk.",
    confidence: 82,
    timeHorizon: "6–18 months",
    affectedSectors: ["AI/ML", "Enterprise SaaS"],
    actionable: "Double down on vertical AI — industry-specific context prevents commodity displacement.",
  },
  {
    id: "a02",
    type: "Risk",
    title: "API-First Business Model Compression Risk",
    rationale: "Foundation model providers (OpenAI, Google, Anthropic) are expanding API feature surface. Companies with <3 proprietary data moats are at margin risk as providers undercut pricing.",
    confidence: 74,
    timeHorizon: "12–24 months",
    affectedSectors: ["AI/ML", "Developer Tools"],
    actionable: "Audit product roadmap for differentiation layers beyond model access. Proprietary datasets or integrations are your moat.",
  },
  {
    id: "a03",
    type: "Tailwind",
    title: "Fintech Infra Consolidation Creates M&A Window",
    rationale: "Post-ZIRP cleanup continues. 60+ fintech startups valued $500M–$2B are exploring strategic exits. Acqui-hires and tech-asset deals below 3x revenue emerging as common structure.",
    confidence: 68,
    timeHorizon: "3–9 months",
    affectedSectors: ["Fintech", "Payments"],
    actionable: "If you have a payments or lending infrastructure angle, now is the window to approach targets or position for acqui-acquisition.",
  },
];

// ── Sector Metrics ─────────────────────────────────────────────────────────

export const SECTOR_METRICS: SectorMetric[] = [
  { sector: "AI / ML",             ytd: 42.1,  momentum: 91, vcActivity: "Very High", avgMultiple: "18–25x",  topRisk: "Platform consolidation",     sparkline: [50,55,62,70,74,78,82,91] },
  { sector: "Cybersecurity",       ytd: 19.4,  momentum: 79, vcActivity: "High",      avgMultiple: "12–18x",  topRisk: "Budget scrutiny in SMB",     sparkline: [58,62,67,70,74,76,79,79] },
  { sector: "Enterprise SaaS",     ytd: 11.2,  momentum: 61, vcActivity: "Moderate",  avgMultiple: "8–12x",   topRisk: "Churn from budget cuts",     sparkline: [48,52,54,58,62,65,63,61] },
  { sector: "Vertical SaaS",       ytd: 15.8,  momentum: 72, vcActivity: "High",      avgMultiple: "10–14x",  topRisk: "Narrow TAM per vertical",    sparkline: [50,54,58,62,66,70,72,72] },
  { sector: "Fintech / Payments",  ytd: -3.2,  momentum: 38, vcActivity: "Low",       avgMultiple: "5–8x",    topRisk: "Regulation, credit losses",  sparkline: [60,55,52,50,48,44,40,38] },
  { sector: "Digital Health",      ytd: 7.8,   momentum: 55, vcActivity: "Moderate",  avgMultiple: "6–10x",   topRisk: "Reimbursement uncertainty",  sparkline: [45,48,52,55,54,56,57,55] },
  { sector: "Climate Tech",        ytd: 22.4,  momentum: 75, vcActivity: "High",      avgMultiple: "10–16x",  topRisk: "Policy dependency",          sparkline: [42,48,55,60,65,70,73,75] },
  { sector: "Developer Tools",     ytd: 9.6,   momentum: 63, vcActivity: "Moderate",  avgMultiple: "8–12x",   topRisk: "Build-vs-buy competition",   sparkline: [55,58,60,63,65,64,64,63] },
];

// ── Calendar Events ──────────────────────────────────────────────────────

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { date: "Apr 10", title: "US CPI Report (March)",        type: "Economic",  impact: "High" },
  { date: "Apr 12", title: "JP Morgan Earnings Q1",        type: "Earnings",  impact: "High" },
  { date: "Apr 17", title: "Goldman Sachs Earnings Q1",    type: "Earnings",  impact: "Medium" },
  { date: "Apr 18", title: "FOMC Beige Book Release",      type: "Fed",       impact: "High" },
  { date: "Apr 22", title: "Tesla Earnings Q1",            type: "Earnings",  impact: "Medium" },
  { date: "Apr 25", title: "Meta & Alphabet Earnings Q1",  type: "Earnings",  impact: "High" },
  { date: "Apr 26", title: "US GDP Q1 Advance Estimate",   type: "Economic",  impact: "High" },
  { date: "May 1",  title: "FOMC Rate Decision",           type: "Fed",       impact: "High" },
];

// ── Chart Data (30-day) ──────────────────────────────────────────────────

export const CHART_30D = Array.from({ length: 30 }, (_, i) => {
  const base = 5100;
  const trend = i * 3.5;
  const noise = Math.sin(i * 0.8) * 40 + Math.sin(i * 0.3) * 60;
  const value = base + trend + noise;
  return {
    day: i + 1,
    label: `Mar ${i + 1 > 26 ? `Apr ${i - 25}` : i + 1}`,
    spx: Math.round(value),
    ai: Math.round(100 + i * 1.4 + Math.sin(i * 0.5) * 8),
    saas: Math.round(100 + i * 0.4 + Math.sin(i * 0.7) * 5),
    volume: Math.round(3.8 + Math.random() * 2),
  };
});
