"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Calculator,
  Crown,
  Users,
  PieChart,
  FileText,
  BarChart3,
  Wallet,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  cashFlow: number;
  transactionsCount: number;
  alertCount: number;
  unreadAlertCount: number;
  recentAlerts: any[];
  chartData: { month: string; revenue: number; expenses: number }[];
  serverUptime: string;
  latestIncomeAmount?: number;
  latestExpenseAmount?: number;
}

// ─── Role-specific card configurations ────────────────────────────

function getCardsForRole(role: string, data: DashboardData | null) {
  const latestIncome = data?.latestIncomeAmount || 0;
  const latestExpense = data?.latestExpenseAmount || 0;

  const revTrendStr = latestIncome > 0 ? `+${formatCurrency(latestIncome)} latest` : "No recent income";
  const expTrendStr = latestExpense > 0 ? `+${formatCurrency(latestExpense)} latest` : "No recent expense";
  const profTrendStr = "Based on recent activity";

  switch (role) {
    case "EMPLOYEE":
      return [
        {
          label: "My Expenses",
          value: data?.totalExpenses || 0,
          icon: Wallet,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: expTrendStr,
          trendUp: false,
          isCurrency: true,
        },
        {
          label: "My Income",
          value: data?.totalRevenue || 0,
          icon: DollarSign,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: revTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Transactions",
          value: data?.transactionsCount || 0,
          icon: Activity,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
        {
          label: "Pending Docs",
          value: 0,
          icon: FileText,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
      ];

    case "ACCOUNTANT":
      return [
        {
          label: "Total Revenue",
          value: data?.totalRevenue || 0,
          icon: DollarSign,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: revTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Total Expenses",
          value: data?.totalExpenses || 0,
          icon: TrendingDown,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: expTrendStr,
          trendUp: false,
          isCurrency: true,
        },
        {
          label: "Audit Alerts",
          value: data?.unreadAlertCount || 0,
          icon: ShieldAlert,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
        {
          label: "Transactions",
          value: data?.transactionsCount || 0,
          icon: Calculator,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
      ];

    case "CFO":
      return [
        {
          label: "Net Profit",
          value: data?.profit || 0,
          icon: Crown,
          color: "text-primary",
          bg: "bg-primary/10",
          trend: profTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Cash Flow",
          value: data?.cashFlow || 0,
          icon: TrendingUp,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: profTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Total Revenue",
          value: data?.totalRevenue || 0,
          icon: DollarSign,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          trend: revTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Risk Alerts",
          value: data?.unreadAlertCount || 0,
          icon: ShieldAlert,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
      ];

    case "MANAGER":
      return [
        {
          label: "Dept. Budget Used",
          value: data?.totalExpenses || 0,
          icon: Target,
          color: "text-purple-400",
          bg: "bg-purple-500/10",
          trend: expTrendStr,
          trendUp: false,
          isCurrency: true,
        },
        {
          label: "Team Expenses",
          value: data?.totalExpenses || 0,
          icon: Users,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: expTrendStr,
          trendUp: false,
          isCurrency: true,
        },
        {
          label: "Pending Approvals",
          value: 0,
          icon: Clock,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
        {
          label: "Approved This Month",
          value: data?.transactionsCount || 0,
          icon: CheckCircle,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
      ];

    case "INVESTOR":
      return [
        {
          label: "Portfolio Value",
          value: data?.totalRevenue || 0,
          icon: PieChart,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
          trend: revTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "ROI",
          value: data?.profit || 0,
          icon: TrendingUp,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: profTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Equity Position",
          value: data?.cashFlow || 0,
          icon: BarChart3,
          color: "text-primary",
          bg: "bg-primary/10",
          trend: profTrendStr,
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Active Alerts",
          value: data?.unreadAlertCount || 0,
          icon: ShieldAlert,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          trend: "",
          trendUp: false,
          isCurrency: false,
        },
      ];

    default:
      return [];
  }
}

const ROLE_TITLES: Record<string, { title: string; subtitle: string }> = {
  EMPLOYEE: {
    title: "My Dashboard",
    subtitle: "Your personal expense and income overview",
  },
  ACCOUNTANT: {
    title: "Accounting Dashboard",
    subtitle: "Organization-wide books and compliance",
  },
  CFO: {
    title: "Executive Dashboard",
    subtitle: "Strategic financial overview and KPIs",
  },
  MANAGER: {
    title: "Department Dashboard",
    subtitle: "Budget oversight and team expenses",
  },
  INVESTOR: {
    title: "Investor Dashboard",
    subtitle: "Portfolio performance and equity tracking",
  },
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role || "EMPLOYEE";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qs = (user as any)?.organizationId ? `?organizationId=${(user as any).organizationId}` : "";
        const [dashRes, txRes] = await Promise.all([
          api(`/dashboard/summary${qs}`, { token }).catch(() => ({
            data: {
              totalRevenue: 0,
              totalExpenses: 0,
              profit: 0,
              cashFlow: 0,
              transactionsCount: 0,
              alertCount: 0,
              unreadAlertCount: 0,
              recentAlerts: [],
              chartData: [],
              serverUptime: "0m 0s",
            },
          })),
          api(`/transactions${qs}`, { token }).catch(() => ({
            data: { transactions: [] },
          })),
        ]);
        setData(dashRes.data);
        const txList = txRes.data?.transactions || txRes.data || [];
        setTransactions(Array.isArray(txList) ? txList.slice(0, 5) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const cards = getCardsForRole(role, data);
  const roleInfo = ROLE_TITLES[role] || ROLE_TITLES.EMPLOYEE;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{roleInfo.title}</h1>
        <p className="text-foreground/50 text-sm mt-1">{roleInfo.subtitle}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-foreground/50">
                {card.label}
              </span>
              <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {card.isCurrency
                ? `$${card.value.toLocaleString()}`
                : card.value}
            </p>
            {card.trend && card.trend !== "No recent income" && card.trend !== "No recent expense" && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}
              >
                {card.trendUp ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {card.trend}
              </div>
            )}
            {(card.trend === "No recent income" || card.trend === "No recent expense") && (
              <div className="flex items-center gap-1 mt-1 text-xs text-foreground/40">
                {card.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {role === "INVESTOR"
              ? "Portfolio Performance"
              : role === "MANAGER"
                ? "Department Spend"
                : "Cash Flow"}
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {role === "INVESTOR" ? "Recent Activity" : "Recent Transactions"}
          </h2>
          {transactions.length === 0 ? (
            <p className="text-foreground/40 text-sm">
              No transactions yet. Add one from the transactions page.
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {tx.category}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {tx.description || tx.type}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}$
                    {tx.amount?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* System Uptime */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px]">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl mb-4">
            <Activity size={24} />
          </div>
          <p className="text-sm font-medium text-foreground/50 mb-1">
            System Uptime
          </p>
          <p className="text-3xl font-bold font-mono text-foreground">
            {data?.serverUptime || "Loading..."}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All systems operational
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Alerts
            </h2>
            {data?.unreadAlertCount ? (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {data.unreadAlertCount} new
              </span>
            ) : null}
          </div>

          {!data?.recentAlerts || data.recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-foreground/40">
              <CheckCircle size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No recent alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`flex gap-3 p-3 rounded-xl border ${
                    !alert.isRead
                      ? "bg-rose-500/5 border-rose-500/20"
                      : "bg-white/[0.02] border-white/[0.05]"
                  }`}
                >
                  <div
                    className={`mt-0.5 shrink-0 ${!alert.isRead ? "text-rose-400" : "text-foreground/40"}`}
                  >
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/90 font-medium">
                      {alert.message}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
