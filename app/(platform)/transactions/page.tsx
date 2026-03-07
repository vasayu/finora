"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { Plus, Search, X } from "lucide-react";

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    type: "EXPENSE",
    category: "",
    description: "",
    currency: "USD",
  });

  const fetchTransactions = async () => {
    try {
      const res = await api("/transactions", { token });
      const txs = res.data?.transactions || res.data || [];
      setTransactions(Array.isArray(txs) ? txs : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/transactions", {
        method: "POST",
        token,
        body: { ...form, amount: parseFloat(form.amount) },
      });
      setForm({
        amount: "",
        type: "EXPENSE",
        category: "",
        description: "",
        currency: "USD",
      });
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      tx.category?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || tx.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Manage your financial transactions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                New Transaction
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-foreground/40 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="e.g. Marketing, Sales, Payroll"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  placeholder="Optional description"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
            placeholder="Search transactions..."
          />
        </div>
        {["ALL", "INCOME", "EXPENSE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-2 rounded-lg transition-all ${filter === f ? "bg-primary/10 text-primary" : "text-foreground/50 hover:text-foreground bg-white/[0.04]"}`}
          >
            {f === "ALL" ? "All" : f === "INCOME" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-xs font-medium text-foreground/40 px-6 py-4">
                Date
              </th>
              <th className="text-left text-xs font-medium text-foreground/40 px-6 py-4">
                Category
              </th>
              <th className="text-left text-xs font-medium text-foreground/40 px-6 py-4">
                Description
              </th>
              <th className="text-left text-xs font-medium text-foreground/40 px-6 py-4">
                Type
              </th>
              <th className="text-right text-xs font-medium text-foreground/40 px-6 py-4">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-foreground/40 text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-foreground/40 text-sm"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-foreground/60">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {tx.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60">
                    {tx.description || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold text-right ${tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}$
                    {tx.amount?.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
