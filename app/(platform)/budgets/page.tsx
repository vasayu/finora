"use client";

import React, { useEffect, useState } from "react";
import { PiggyBank, Plus, Trash2, MessageCircle, FileText } from "lucide-react";
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

  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [settlementFilter, setSettlementFilter] = useState("ALL");

  // Active Budget SPA State
  const [activeBudget, setActiveBudget] = useState<string | null>(null);
  const [activeBudgetData, setActiveBudgetData] = useState<any>(null);
  const [loadingActiveBudget, setLoadingActiveBudget] = useState(false);

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

  const fetchOrgMembers = async () => {
    if (!token) return;
    try {
      const res = await api("/organizations/members", { token });
      const data = res.data || {};
      let allMembers = [];
      if (data.cfo || data.managers || data.employees) {
        allMembers = [...(data.cfo || []), ...(data.managers || []), ...(data.employees || [])];
      } else if (Array.isArray(data.users)) {
        allMembers = data.users;
      } else if (Array.isArray(data)) {
        allMembers = data;
      }
      setOrgMembers(allMembers);
    } catch (err) { }
  };

  useEffect(() => {
    fetchBudgets();
    fetchOrgMembers();
  }, [token]);

  useEffect(() => {
    if (!activeBudget || !token) return;
    const fetchActiveBudget = async () => {
      setLoadingActiveBudget(true);
      try {
        const res = await api(`/budgets/${activeBudget}`, { token });
        setActiveBudgetData(res.data.budget);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActiveBudget(false);
      }
    };
    fetchActiveBudget();
  }, [activeBudget, token]);

  const toggleSettlementApproval = async (settlementId: string, currentStatus: boolean) => {
    if (!token || !activeBudget) return;
    try {
      await api(`/budgets/settlement/${settlementId}`, {
         method: "PUT",
         token,
         body: { approved: !currentStatus }
      });
      // Quick re-fetch to organically update gauges and limits locally
      const res = await api(`/budgets/${activeBudget}`, { token });
      setActiveBudgetData(res.data.budget);
    } catch (err) {
      console.error("Failed to toggle approval:", err);
    }
  };

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
          memberIds: selectedMembers.map(m => m.id)
        }
      });

      setShowCreateModal(false);
      setName("");
      setAmount("");
      setCategory("");
      setSelectedMembers([]);
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

  const updateBudgetMembers = async (newMemberIds: string[]) => {
    if (!token || !activeBudget) return;
    try {
      await api(`/budgets/${activeBudget}/members`, {
        method: "PATCH",
        token,
        body: { memberIds: newMemberIds }
      });
      // Re-fetch active budget data to update UI
      const res = await api(`/budgets/${activeBudget}`, { token });
      setActiveBudgetData(res.data.budget);
    } catch (err) {
      console.error("Failed to update budget members:", err);
    }
  };

  const onAddMember = (memberId: string) => {
    const currentMembers = activeBudgetData?.analytics?.members || [];
    const memberIds = [...currentMembers.map((m: any) => m.id), memberId];
    updateBudgetMembers(memberIds);
    setMemberSearch("");
    setShowMemberDropdown(false);
  };

  const onRemoveMember = (memberId: string) => {
    const currentMembers = activeBudgetData?.analytics?.members || [];
    const memberIds = currentMembers
      .map((m: any) => m.id)
      .filter((id: string) => id !== memberId);
    updateBudgetMembers(memberIds);
  };

  const getFilteredSettlements = () => {
    if (!activeBudgetData?.analytics?.settlements) return [];
    if (settlementFilter === "ALL") return activeBudgetData.analytics.settlements;
    return activeBudgetData.analytics.settlements.filter((s: any) => {
        const normalized = (s.category || "Other").trim().toLowerCase();
        return normalized === settlementFilter.toLowerCase();
    });
  };

  const getSettlementCategories = () => {
    if (!activeBudgetData?.analytics?.settlements) return [];
    const categories = new Set<string>(
      activeBudgetData.analytics.settlements.map((s: any) => 
        (s.category as string || "Other").trim().toLowerCase()
      )
    );
    return Array.from(categories).map((cat: string) => 
        cat.charAt(0).toUpperCase() + cat.slice(1)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  if (activeBudget) {
    const b = activeBudgetData;
    if (loadingActiveBudget || !b) {
      return (
        <div className="max-w-[1400px] mx-auto w-full pb-20">
          <div className="animate-pulse bg-white/5 border border-white/10 h-[500px] rounded-3xl" />
        </div>
      );
    }
    const isAlert = b.progressPercentage >= 100;
    
    return (
      <div className="max-w-[1400px] mx-auto w-full pb-20 animate-in fade-in duration-300">
         <button onClick={() => { setActiveBudget(null); fetchBudgets(); }} className="mb-6 flex items-center text-foreground/50 hover:text-white transition-colors">
            &larr; Back to Budgets
         </button>
         
         <div className={`p-8 rounded-3xl border ${isAlert ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'bg-[#141419] border-white/10 shadow-2xl'} mb-8 relative overflow-hidden transition-all`}>
           {isAlert && <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />}
           
           <h1 className="text-4xl font-bold text-white mb-2">{b.name}</h1>
           <p className="text-foreground/60 mb-8">{b.category ? `Tracking transactions matching category: ${b.category}` : 'Tracking all organization expenses implicitly'}</p>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <div>
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <p className="text-sm font-medium text-foreground/50 mb-1">Total Recorded Spent</p>
                   <p className="text-5xl font-bold tracking-tight text-white">{formatCurrency(b.spent)}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-medium text-foreground/50 mb-1">Allocated Budget</p>
                   <p className="text-2xl font-semibold text-foreground/70">{formatCurrency(b.amount)}</p>
                 </div>
               </div>

               <div className="relative pt-4">
                  <div className="h-4 w-full bg-[#0a0a0c] rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <div 
                      className={`h-full ${isAlert ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-1000 ease-out`} 
                      style={{ width: `${b.progressPercentage}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-3">
                    <span className={isAlert ? 'text-red-400 font-bold' : 'text-foreground/70 font-medium'}>
                      {b.progressPercentage.toFixed(1)}% Usage {isAlert && " (CRITICAL LIMIT REACHED)"}
                    </span>
                    <span className={b.remaining < 0 ? 'text-red-400 font-bold tracking-tight' : 'text-emerald-400 font-bold tracking-tight'}>
                      {formatCurrency(b.remaining)} Remaining
                    </span>
                  </div>
               </div>
             </div>

             <div className="bg-black/30 rounded-2xl p-6 border border-white/5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                   <h3 className="text-lg font-semibold text-white">Accountable Members</h3>
                   <div className="relative">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus-within:border-primary/50 transition-all">
                        <Plus size={14} className="text-foreground/40" />
                        <input 
                          type="text" 
                          placeholder="Add member..." 
                          className="bg-transparent border-none text-xs text-white focus:outline-none w-32"
                          value={memberSearch}
                          onChange={(e) => {
                            setMemberSearch(e.target.value);
                            setShowMemberDropdown(true);
                          }}
                        />
                      </div>
                      
                      {showMemberDropdown && memberSearch && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                          {orgMembers
                            .filter(m => 
                              (m.firstName.toLowerCase().includes(memberSearch.toLowerCase()) || 
                               m.email.toLowerCase().includes(memberSearch.toLowerCase())) &&
                              !(activeBudgetData?.analytics?.members || []).some((am: any) => am.id === m.id)
                            )
                            .map(m => (
                              <button
                                key={m.id}
                                onClick={() => onAddMember(m.id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                  {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-white truncate">{m.firstName} {m.lastName}</p>
                                  <p className="text-[10px] text-foreground/40 truncate">{m.email}</p>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                   </div>
                </div>

                {activeBudgetData?.analytics?.members?.length === 0 ? (
                  <p className="text-foreground/50 text-sm italic py-8 text-center border border-dashed border-white/10 rounded-xl">No members explicitly assigned to this budget limit.</p>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {activeBudgetData?.analytics?.members?.map((m: any) => (
                       <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group/member">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0 border border-primary/20">
                             {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                           </div>
                           <div>
                             <p className="text-sm font-medium text-white">{m.firstName} {m.lastName}</p>
                             <p className="text-xs text-foreground/50">{m.email}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="text-right shrink-0">
                             <p className="text-[10px] text-foreground/40 mb-0.5 font-bold uppercase tracking-wider">Spending</p>
                             <p className="text-sm font-bold text-white">{formatCurrency(m.spent)}</p>
                           </div>
                           <button 
                             onClick={() => onRemoveMember(m.id)}
                             className="p-2 text-foreground/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover/member:opacity-100 transition-all"
                           >
                             <Trash2 size={14} className="pointer-events-none" />
                           </button>
                         </div>
                       </div>
                    ))}
                  </div>
                )}
             </div>
           </div>

            {/* Full Width Ledger for Detailed Activity at the bottom */}
            <div className="mt-8 bg-[#0a0a0f] rounded-3xl p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Recorded Settlements</span>
                    <span className="text-xs font-bold bg-white/5 text-foreground/40 px-2 py-0.5 rounded border border-white/10">{b.analytics?.settlements?.length || 0}</span>
                  </h3>
                  <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest font-semibold">Audit Ledger & Transaction History</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  <button
                    onClick={() => setSettlementFilter("ALL")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                      settlementFilter === "ALL" 
                        ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                        : 'bg-white/5 text-foreground/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    All
                  </button>
                  {getSettlementCategories().map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSettlementFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                        settlementFilter === cat 
                          ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                          : 'bg-white/5 text-foreground/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {b.analytics?.settlements?.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-foreground/20">
                      <FileText size={32} />
                    </div>
                    <p className="text-foreground/40 text-sm max-w-sm italic">No recorded settlements physically matched or tied to this explicit Budget limit: "@{(b.name as string).replace(/\s/g,"_")}".</p>
                 </div>
              ) : getFilteredSettlements().length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <p className="text-foreground/40 text-sm italic">No settlements found in "{settlementFilter}" category for this budget.</p>
                 </div>
              ) : (
                 <div className="space-y-3">
                   {getFilteredSettlements().map((s: any) => (
                    <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 transition-all hover:bg-white/10">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className={`w-2 h-10 rounded-full shrink-0 ${s.approved ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-red-500/30'}`} />
                        <div>
                          <p className="text-sm font-semibold text-white flex items-center gap-2">
                             {s.towards || 'Unknown Payment Receiver'}
                             <span className="text-[10px] uppercase font-bold text-foreground/40 bg-white/5 px-2 py-0.5 rounded leading-none">{s.date}</span>
                          </p>
                          <p className={`text-xs mt-1 ${s.approved ? 'text-foreground/60' : 'text-red-400 font-medium'}`}>
                             {s.approved ? `Mapped dynamically via category: ${s.category} — Handled by ${s.byUser}` : `SKIPPED: Disapproved. Waiting for manual override.`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 self-start sm:self-auto">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${s.approved ? 'text-white' : 'text-foreground/40 line-through decoration-red-500/50 decoration-2'}`}>{formatCurrency(s.amount)}</p>
                        </div>
                        <button 
                          onClick={() => toggleSettlementApproval(s.id, s.approved)}
                          className={`px-4 h-9 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shrink-0 ${s.approved ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}
                        >
                          {s.approved ? 'Disapprove' : 'Approve'}
                        </button>
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
              <div 
                key={budget.id} 
                className="bg-[#141419] border border-white/[0.06] hover:border-white/[0.1] hover:scale-[1.02] cursor-pointer rounded-2xl p-6 transition-all shadow-xl group flex flex-col relative overflow-hidden"
                onClick={() => setActiveBudget(budget.id)}
              >
                {/* Delete button (shows on hover) */}
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(budget.id); }}
                  className="absolute top-4 right-4 p-2 text-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 size={16} className="pointer-events-none" />
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

              {/* Member Assignment Section */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Assign Members (Accountable)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberDropdown(true);
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors pointer-events-auto"
                    placeholder="Search by name or email..."
                  />
                  {showMemberDropdown && memberSearch.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {orgMembers.filter(m => (m.firstName + ' ' + m.lastName + ' ' + m.email).toLowerCase().includes(memberSearch.toLowerCase())).map((m) => (
                        <div
                          key={m.id}
                          className="px-4 py-2 hover:bg-white/5 cursor-pointer text-sm text-foreground flex flex-col"
                          onClick={() => {
                            if (!selectedMembers.find(sm => sm.id === m.id)) {
                              setSelectedMembers([...selectedMembers, m]);
                            }
                            setMemberSearch("");
                            setShowMemberDropdown(false);
                          }}
                        >
                          <span className="font-medium">{m.firstName} {m.lastName}</span>
                          <span className="text-xs text-foreground/50">{m.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Members Chips */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-xs text-foreground/80 font-medium">{m.firstName} {m.lastName}</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                             e.stopPropagation();
                             setSelectedMembers(selectedMembers.filter(sm => sm.id !== m.id));
                          }}
                          className="text-foreground/40 hover:text-red-400"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              This action cannot be undone. Are you sure you want to permanently delete this budget?<br/><br/>
              <span className="text-red-400 font-medium">Warning:</span> All recorded settlements and mapped ledger transactions for this budget will also be permanently deleted.
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
