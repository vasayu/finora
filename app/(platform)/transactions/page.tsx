"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { Plus, Search, X, Edit2, Trash2, Upload, Download } from "lucide-react";

export default function TransactionsPage() {
  const { token, user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; errors?: string[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    amount: "",
    type: "EXPENSE",
    category: "",
    description: "",
    currency: "USD",
  });

  const fetchTransactions = async () => {
    try {
      const qs = (user as any)?.organizationId ? `?organizationId=${(user as any).organizationId}` : "";
      const res = await api(`/transactions${qs}`, { token });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEditing = !!editingId;
      await api(isEditing ? `/transactions/${editingId}` : "/transactions", {
        method: isEditing ? "PUT" : "POST",
        token,
        body: { 
          ...form, 
          amount: parseFloat(form.amount),
          ...((user as any)?.organizationId && { organizationId: (user as any).organizationId })
        },
      });
      setForm({
        amount: "",
        type: "EXPENSE",
        category: "",
        description: "",
        currency: "USD",
      });
      setEditingId(null);
      setShowForm(false);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/transactions/import/template`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Finora_Transactions_Template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download template", err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    setImportError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/transactions/import/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json?.message || "Import failed. Please check your file and try again.");
      } else {
        const count = json?.data?.importedCount ?? 0;
        setImportResult({ count });
        fetchTransactions();
      }
    } catch (err: any) {
      console.error("Import failed", err);
      setImportError(err?.message || "Network error. Please try again.");
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleEdit = (tx: any) => {
    setForm({
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
      description: tx.description || "",
      currency: tx.currency,
    });
    setEditingId(tx.id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    const idToDelete = deleteConfirmId;
    setDeleteConfirmId(null); // Close the dialog immediately
    try {
      await api(`/transactions/${idToDelete}`, { method: "DELETE", token });
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportForm(true)}
            className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-foreground text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Upload size={16} /> Import Excel
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({
                amount: "",
                type: "EXPENSE",
                category: "",
                description: "",
                currency: "USD",
              });
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} /> Add Transaction
          </button>
        </div>
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
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-foreground/40 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value="" disabled className="bg-[#0a0a0a] text-foreground/50">Select category...</option>
                  {form.type === "INCOME" ? (
                    <>
                      <option value="Sales" className="bg-[#0a0a0a]">Sales / Revenue</option>
                      <option value="Services" className="bg-[#0a0a0a]">Service Income</option>
                      <option value="Investment" className="bg-[#0a0a0a]">Investment Return</option>
                      <option value="Capital" className="bg-[#0a0a0a]">Share Capital</option>
                      <option value="Loan" className="bg-[#0a0a0a]">Loan Received</option>
                      <option value="Other Income" className="bg-[#0a0a0a]">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Payroll" className="bg-[#0a0a0a]">Payroll & Salaries</option>
                      <option value="Marketing" className="bg-[#0a0a0a]">Marketing & Ads</option>
                      <option value="Equipment" className="bg-[#0a0a0a]">Equipment & Property</option>
                      <option value="Software" className="bg-[#0a0a0a]">Software & SaaS</option>
                      <option value="Inventory" className="bg-[#0a0a0a]">Inventory & Raw Materials</option>
                      <option value="Utilities" className="bg-[#0a0a0a]">Utilities & Rent</option>
                      <option value="Insurance" className="bg-[#0a0a0a]">Prepaid Expenses & Insurance</option>
                      <option value="Vendor" className="bg-[#0a0a0a]">Contractors & Vendors</option>
                      <option value="Debt Paydown" className="bg-[#0a0a0a]">Debt Servicing</option>
                      <option value="Other Expense" className="bg-[#0a0a0a]">Other Expenses</option>
                    </>
                  )}
                </select>
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
                {submitting ? "Saving..." : editingId ? "Update Transaction" : "Create Transaction"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Upload size={18} className="text-primary" />
                Bulk Import
              </h2>
              <button
                onClick={() => { setShowImportForm(false); setImportResult(null); setImportError(null); }}
                className="text-foreground/40 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Success banner */}
            {importResult && (
              <div className="mb-4 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <span className="text-emerald-400 text-lg leading-none mt-0.5">✓</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {importResult.count} transaction{importResult.count !== 1 ? 's' : ''} imported successfully!
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">Your transaction list has been updated.</p>
                </div>
              </div>
            )}

            {/* Error banner */}
            {importError && (
              <div className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-lg leading-none mt-0.5">✕</span>
                <div>
                  <p className="text-sm font-semibold text-red-400">Import failed</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{importError}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
                <p className="text-sm text-foreground/70 mb-3">
                  Download the template — it has the exact columns Finora expects:
                  <span className="block mt-1 text-foreground/50 font-mono text-xs">Date · Type · Category · Description · Amount</span>
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full inline-flex justify-center items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-foreground font-semibold py-2.5 rounded-xl transition-all border border-white/[0.08]"
                >
                  <Download size={16} /> Download Template
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Upload Filled Template
                </label>
                <label className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                  importResult
                    ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                    : 'border-white/[0.1] bg-white/[0.02] hover:border-primary/50 hover:bg-primary/5'
                }`}>
                  {importing ? (
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : importResult ? (
                    <>
                      <span className="text-3xl mb-2">✓</span>
                      <span className="text-sm text-emerald-400 font-medium">{importResult.count} rows imported</span>
                      <span className="text-xs text-foreground/40 mt-1">Click to upload another file</span>
                    </>
                  ) : (
                    <>
                      <Upload size={28} className="text-foreground/40 group-hover:text-primary mb-3 transition-colors" />
                      <span className="text-sm text-foreground/80 font-medium">Click to upload .xlsx file</span>
                      <span className="text-xs text-foreground/40 mt-1">Columns: Date, Type, Category, Description, Amount</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImport}
                    disabled={importing}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <Trash2 size={24} />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Transaction?</h2>
            <p className="text-foreground/60 text-sm mb-6">
              This action cannot be undone. Are you sure you want to permanently delete this transaction?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-foreground font-medium transition-colors border border-white/[0.08]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
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
              <th className="text-center text-xs font-medium text-foreground/40 px-6 py-4 w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-foreground/40 text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-1.5 text-foreground/40 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Edit Transaction"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
