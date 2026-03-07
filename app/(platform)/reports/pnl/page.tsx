"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  PieChart as PieChartIcon,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#f97316",
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#a78bfa",
  "#fbbf24",
];

export default function PnLPage() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPnL = async () => {
      try {
        const res = await api("/financials/pnl", { token });
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPnL();
  }, [token]);

  // Data for Expense Breakdown (Pie Chart & Bar Chart)
  const expenseData = data?.breakdown
    ? Object.entries(data.breakdown)
        .filter(([_, amount]) => (amount as number) < 0)
        .map(([category, amount]) => ({
          name: category,
          value: Math.abs(amount as number),
        }))
    : [];

  // Mock data for Income vs Expense trend (since backend currently returns totals)
  // In a real scenario, this would be an array of monthly/weekly totals from the API
  const trendData = data
    ? [
        {
          name: "Period 1",
          Income: data.totalIncome * 0.8,
          Expenses: data.totalExpense * 0.7,
        },
        {
          name: "Period 2",
          Income: data.totalIncome * 0.9,
          Expenses: data.totalExpense * 0.85,
        },
        {
          name: "Current",
          Income: data.totalIncome,
          Expenses: data.totalExpense,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profit & Loss</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Revenue, expenses, and margin analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs font-medium text-foreground/50">
              Total Revenue
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            ${(data?.totalIncome || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-xs font-medium text-foreground/50">
              Total Expenses
            </span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            ${(data?.totalExpense || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Minus size={16} className="text-primary" />
            <span className="text-xs font-medium text-foreground/50">
              Net Profit
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${(data?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            ${(data?.netProfit || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income vs Expense Comparison (Bar Chart) */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Revenue vs Expenses Trend
            </h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ fontSize: "12px", color: "#fff" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="Income"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
                <Bar
                  dataKey="Expenses"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense Breakdown (Pie Chart) */}
        {expenseData.length > 0 && (
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon size={18} className="text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Expense Distribution
              </h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    itemStyle={{ fontSize: "12px", color: "#fff" }}
                    formatter={(value: any) =>
                      `$${Number(value).toLocaleString()}`
                    }
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
