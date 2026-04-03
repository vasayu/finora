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

  // Data for Expense Breakdown (Pie Chart matching DB actual categories)
  const expenseData = data?.breakdown 
    ? Object.entries(data.breakdown)
        .filter(([_, amount]) => Math.abs(amount as number) > 0)
        .map(([category, amount]) => ({
          name: category,
          value: Math.abs(amount as number),
        }))
    : [];

  const plannedVsActualData = data?.plannedVsActualData || [];

  const renderGrowth = (value?: number, inverse: boolean = false) => {
    if (value === undefined || isNaN(value)) return null;
    if (value === 0) return <span className="text-xs font-medium text-foreground/40 ml-2">0% (MoM)</span>;
    // For expenses, higher growth is visually "bad", so inverse flips the color
    const isPositive = value > 0;
    const colorClass = inverse ? (isPositive ? "text-red-400" : "text-emerald-400") : (isPositive ? "text-emerald-400" : "text-red-400");
    const sign = isPositive ? "+" : "";
    return <span className={`text-xs font-medium ml-2 ${colorClass}`}>{sign}{value.toFixed(1)}% (MoM)</span>;
  };

  // Map the new dynamic chronological array delivered by the financials backend
  const dynamicTrendData = data?.monthlyTrend || [];

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

      {/* Key Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-xs font-medium text-foreground/50">
              Total Revenue
            </span>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold text-emerald-400">
              ${(data?.totalIncome || 0).toLocaleString()}
            </p>
            {renderGrowth(data?.growth?.revenueGrowth, false)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-xs font-medium text-foreground/50">
              Total Expenses
            </span>
          </div>
          <div className="flex items-end">
            <p className="text-2xl font-bold text-red-400">
              ${(data?.totalExpense || 0).toLocaleString()}
            </p>
            {renderGrowth(data?.growth?.expenseGrowth, true)}
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Minus size={16} className="text-primary" />
            <span className="text-xs font-medium text-foreground/50">
              Net Profit
            </span>
          </div>
          <div className="flex items-end">
            <p
              className={`text-2xl font-bold ${(data?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              ${(data?.netProfit || 0).toLocaleString()}
            </p>
            {renderGrowth(data?.growth?.profitGrowth, false)}
          </div>
        </div>
      </div>

      {/* Startup & Margins Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs font-medium text-foreground/50 mb-1">Gross Margin</span>
            <p className="text-lg font-bold text-foreground">{(data?.margins?.grossProfitMargin || 0).toFixed(1)}%</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs font-medium text-foreground/50 mb-1">Operating Margin</span>
            <p className="text-lg font-bold text-foreground">{(data?.margins?.operatingMargin || 0).toFixed(1)}%</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-xs font-medium text-foreground/50 mb-1">Net Margin</span>
            <p className="text-lg font-bold text-foreground">{(data?.margins?.netProfitMargin || 0).toFixed(1)}%</p>
        </div>
        <div className="bg-[#0a0a0a] border border-primary/20 rounded-2xl p-4 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-transparent">
            <span className="text-xs font-medium text-foreground/50 mb-1">Monthly Burn Rate</span>
            <p className="text-lg font-bold text-red-400">${(data?.burnRate || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-primary/20 rounded-2xl p-4 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-transparent">
            <span className="text-xs font-medium text-foreground/50 mb-1">Runway</span>
            <p className="text-lg font-bold text-emerald-400">
                {(data?.runwayMonths || 0) > 99 ? '99+' : (data?.runwayMonths || 0).toFixed(1)} <span className="text-xs text-foreground/50 font-normal">months</span>
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
                data={dynamicTrendData}
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
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="#ffffff" 
                    className="text-base font-bold"
                  >
                    Expenses
                  </text>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
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
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {/* Chart 3: Planned vs Actual Expenses */}
        {plannedVsActualData.length > 0 && (
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 size={18} className="text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Planned vs Actual Expenses
                </h2>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={plannedVsActualData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                      }}
                      itemStyle={{ fontSize: "12px", color: "#fff" }}
                      formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="actual"
                      name="Actual"
                      fill="#f87171"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="planned"
                      name="Planned"
                      fill="#60a5fa"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        )}
      </div>

      {/* Missing Data Warnings */}
      {(data?.missingDataFlags?.plannedBudget || data?.missingDataFlags?.cashBalance) && (
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
            <h3 className="text-sm font-semibold text-primary mb-1">Want to see more accurate forecasting?</h3>
            <p className="text-xs text-foreground/60 max-w-2xl mx-auto">
                Some metrics like Burn Rate, Runway, and Planned vs Actual Expenses require specific data. 
                If you want to track these accurately, please ensure your uploaded documents include a 
                <span className="text-foreground font-medium"> Planned/Budget Amount</span> column and that cash balances are up to date!
            </p>
        </div>
      )}
    </div>
  );
}
