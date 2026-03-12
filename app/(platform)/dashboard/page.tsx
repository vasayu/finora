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

const mockChartData = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 5000, expenses: 3200 },
  { month: "Apr", revenue: 4780, expenses: 3908 },
  { month: "May", revenue: 5890, expenses: 4800 },
  { month: "Jun", revenue: 6390, expenses: 3800 },
  { month: "Jul", revenue: 7490, expenses: 4300 },
];

interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  cashFlow: number;
  transactionsCount: number;
  alertCount: number;
  unreadAlertCount: number;
  recentAlerts: any[];
}

// ─── Role-specific card configurations ────────────────────────────

function getCardsForRole(role: string, data: DashboardData | null) {
  switch (role) {
    case "EMPLOYEE":
      return [
        {
          label: "My Expenses",
          value: data?.totalExpenses || 0,
          icon: Wallet,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: "-3.2%",
          trendUp: false,
          isCurrency: true,
        },
        {
          label: "My Income",
          value: data?.totalRevenue || 0,
          icon: DollarSign,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: "+5.1%",
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
          trend: "+12.5%",
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Total Expenses",
          value: data?.totalExpenses || 0,
          icon: TrendingDown,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: "-3.2%",
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
          trend: "+18.7%",
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Cash Flow",
          value: data?.cashFlow || 0,
          icon: TrendingUp,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: "+8.3%",
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Total Revenue",
          value: data?.totalRevenue || 0,
          icon: DollarSign,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          trend: "+12.5%",
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
          trend: "-5.2%",
          trendUp: false,
          isCurrency: true,
        },
        {
          label: "Team Expenses",
          value: data?.totalExpenses || 0,
          icon: Users,
          color: "text-red-400",
          bg: "bg-red-500/10",
          trend: "+2.1%",
          trendUp: true,
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
          trend: "+15.3%",
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "ROI",
          value: data?.profit || 0,
          icon: TrendingUp,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          trend: "+22.1%",
          trendUp: true,
          isCurrency: true,
        },
        {
          label: "Equity Position",
          value: data?.cashFlow || 0,
          icon: BarChart3,
          color: "text-primary",
          bg: "bg-primary/10",
          trend: "+9.6%",
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
        const [dashRes, txRes] = await Promise.all([
          api("/dashboard/summary", { token }).catch(() => ({
            data: {
              totalRevenue: 0,
              totalExpenses: 0,
              profit: 0,
              cashFlow: 0,
              transactionsCount: 0,
              alertCount: 0,
              unreadAlertCount: 0,
              recentAlerts: [],
            },
          })),
          api("/transactions", { token }).catch(() => ({
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
            {card.trend && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}
              >
                {card.trendUp ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {card.trend} from last month
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
              <AreaChart data={mockChartData}>
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
    </div>
  );
}
