"use client";

import React, { useEffect, useState } from "react";
import { PiggyBank, Plus, Trash2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";

interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string | null;
  period: string;
  spent: number;
  remaining: number;
  progressPercentage: number;
  createdAt: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Create form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const fetchBudgets = async () => {
    if (!token) return;
    try {
      const res = await api("/budgets", { token });
      setBudgets(res.data.budgets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !token) return;

    try {
      await api("/budgets", {
        method: "POST",
        token,
        body: {
          name,
          amount: parseFloat(amount),
          category: category || undefined,
        }
      });

      setShowCreateModal(false);
      setName("");
      setAmount("");
      setCategory("");
      fetchBudgets();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create budget");
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || !token) return;
    try {
      await api(`/budgets/${deleteConfirmId}`, {
        method: "DELETE",
        token
      });
      setBudgets(budgets.filter(b => b.id !== deleteConfirmId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-10 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <PiggyBank size={20} />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Budgets Overview
            </h1>
          </div>
          <p className="text-foreground/50 max-w-2xl text-sm leading-relaxed">
            Create budgets, track spending limits, and visualize dynamic remaining balances automatically updated by your transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/telegram"
            className="h-10 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-sm font-medium text-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Telegram Receipts
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium text-black transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Budget
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-[200px] bg-white/5 border border-white/[0.05] rounded-2xl animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl bg-[#0f0f13]">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 items-center justify-center mb-4 border border-emerald-500/20">
            <PiggyBank size={28} />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Budgets Found</h3>
          <p className="text-foreground/50 text-sm max-w-md mx-auto mb-6">
            Create your first budget to start tracking your dynamic expense limits.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-6 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium text-black transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Plus size={16} />
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const isOverBudget = budget.progressPercentage >= 100;
            const progressColor = isOverBudget ? 'bg-red-500' : (budget.progressPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500');

            return (
              <div key={budget.id} className="bg-[#141419] border border-white/[0.06] hover:border-white/[0.1] rounded-2xl p-6 transition-all shadow-xl group flex flex-col relative overflow-hidden">
                {/* Delete button (shows on hover) */}
                <button
                  onClick={() => setDeleteConfirmId(budget.id)}
                  className="absolute top-4 right-4 p-2 text-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex justify-between items-start mb-6 z-10">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{budget.name}</h3>
                    {budget.category && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-foreground/40 border border-white/10">
                        {budget.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 flex-1 z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-medium text-foreground/40 mb-1">Spent</p>
                      <p className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(budget.spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-foreground/40 mb-1">Total Budget</p>
                      <p className="text-sm font-semibold text-foreground/70">{formatCurrency(budget.amount)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative pt-2">
                    <div className="flex justify-between text-xs mb-2">
                      <span className={isOverBudget ? 'text-red-400 font-medium' : 'text-foreground/60'}>
                        {budget.progressPercentage.toFixed(1)}% Used
                      </span>
                      <span className={budget.remaining < 0 ? 'text-red-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {formatCurrency(budget.remaining)} Left
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#0a0a0c] rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className={`h-full ${progressColor} transition-all duration-1000 ease-out`} 
                        style={{ width: `${budget.progressPercentage}%` }} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Background Glow */}
                <div 
                  className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-[#141419] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Create New Budget</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-foreground/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Trash2 className="hidden" /> {/* Prevents unused lint */}
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Budget Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="e.g., Marketing, Office Supplies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Category Match (Optional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Exact Transaction Category Name"
                />
                <p className="text-xs text-foreground/40 mt-1.5">Leaves empty to track total organization expenses.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-10 px-4 rounded-xl text-sm font-medium text-foreground/70 hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name || !amount}
                  className="h-10 px-6 bg-primary hover:bg-primary/90 disabled:opacity-50 text-black rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-[#141419] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <Trash2 size={24} />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Delete Budget?</h2>
            <p className="text-foreground/60 text-sm mb-6">
              This action cannot be undone. Are you sure you want to permanently delete this budget constraint?
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
