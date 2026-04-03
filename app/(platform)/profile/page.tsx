"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/Components/AuthProvider";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle,
  Building2,
  MapPin,
  TrendingUp,
  DollarSign,
  ExternalLink,
  LineChart,
  Users,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, updateProfile, fetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  
  // Organization fields
  const [orgForm, setOrgForm] = useState({ 
    orgName: "", domain: "", role: "EMPLOYEE", position: "",
    revenueRange: "", fundingStage: "", companyType: "Private", stockTicker: "", headquarters: "", size: "", linkedinUrl: ""
  });
  const [orgMode, setOrgMode] = useState<"idle" | "create" | "join">("idle");
  const [orgActionLoading, setOrgActionLoading] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [orgSuccess, setOrgSuccess] = useState("");
  const { token } = useAuth();
  const [myOrg, setMyOrg] = useState<any>(null);

  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
  const [isDeleteOrgModalOpen, setIsDeleteOrgModalOpen] = useState(false);
  const [editOrgForm, setEditOrgForm] = useState<any>({});
  const [editOrgLoading, setEditOrgLoading] = useState(false);
  const [deleteOrgLoading, setDeleteOrgLoading] = useState(false);

  // Re-fetch function
  const refetchOrg = async () => {
    if (!token) return;
    try {
      const res = await api<{ data: { organization: any } }>("/organizations/my-org", { token });
      setMyOrg(res.data.organization);
    } catch {
      setMyOrg(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.organizationId && token) {
      refetchOrg();
    }
  }, [user?.organizationId, token]);

  useEffect(() => {
    if (user)
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      setIsEditing(false);
      setSuccess("Profile updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOrgAction = async (action: "create" | "join") => {
    setOrgActionLoading(true);
    setOrgError("");
    setOrgSuccess("");
    try {
      // dynamic import or fetch
      const res = await fetch(`http://localhost:5000/api/v1/organizations/${action === "create" ? "" : "join"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: orgForm.orgName,
          domain: orgForm.domain,
          role: orgForm.role,
          position: orgForm.position,
          revenueRange: orgForm.revenueRange,
          fundingStage: orgForm.fundingStage,
          companyType: orgForm.companyType,
          stockTicker: orgForm.companyType === "Public" ? orgForm.stockTicker : undefined,
          headquarters: orgForm.headquarters,
          size: orgForm.size,
          linkedinUrl: orgForm.linkedinUrl
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");
      setOrgSuccess(action === "create" ? "Organization created!" : "Joined organization!");
      setOrgMode("idle");
      await fetchProfile();
      setTimeout(() => setOrgSuccess(""), 3000);
    } catch (err: any) {
      setOrgError(err.message);
    } finally {
      setOrgActionLoading(false);
    }
  };

  const handleEditOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditOrgLoading(true);
    try {
      await api(`/organizations/${myOrg.id}`, {
        method: "PUT",
        token,
        body: {
          ...editOrgForm,
          stockTicker: editOrgForm.companyType === "Public" ? editOrgForm.stockTicker : undefined,
        },
      });
      setIsEditOrgModalOpen(false);
      await refetchOrg();
      await fetchProfile();
      setOrgSuccess("Organization updated successfully!");
      setTimeout(() => setOrgSuccess(""), 3000);
    } catch (err: any) {
       setOrgError(err.message || "Failed to edit organization");
       setTimeout(() => setOrgError(""), 3000);
    } finally {
      setEditOrgLoading(false);
    }
  };

  const handleDeleteOrg = async () => {
    setDeleteOrgLoading(true);
    try {
      await api("/organizations/leave", {
        method: "DELETE",
        token,
      });
      setIsDeleteOrgModalOpen(false);
      fetchProfile();
      setMyOrg(null);
      setOrgSuccess("Successfully left organization!");
      setTimeout(() => setOrgSuccess(""), 3000);
    } catch (err: any) {
      setOrgError(err.message || "Failed to leave organization");
      setIsDeleteOrgModalOpen(false);
      setTimeout(() => setOrgError(""), 3000);
    } finally {
      setDeleteOrgLoading(false);
    }
  };

  if (!user) return null;

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xl font-bold">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-foreground/50 text-sm flex items-center gap-1.5 mt-1">
                  <Mail size={14} />
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    <Shield size={12} />
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-primary bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 transition-all"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError("");
                    setForm({
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                    });
                  }}
                  className="inline-flex items-center gap-2 text-sm text-foreground/60 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 transition-all"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-orange-600 rounded-xl px-4 py-2.5 transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              <p className="text-emerald-400 text-sm">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground/40 mb-1.5 block">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
                  <User size={14} className="text-foreground/30" />
                  <span className="text-sm text-foreground">
                    {user.firstName}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/40 mb-1.5 block">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
                  <User size={14} className="text-foreground/30" />
                  <span className="text-sm text-foreground">
                    {user.lastName}
                  </span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-foreground/40 mb-1.5 block">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
                  <Mail size={14} className="text-foreground/30" />
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization Section */}
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 mb-6">
           <h2 className="text-lg font-bold text-foreground mb-4">Organization Setup</h2>
           
           {orgSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-emerald-400 text-sm">{orgSuccess}</p>
            </div>
           )}
           {orgError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{orgError}</p>
            </div>
           )}

           {!user.organizationId ? (
             <div className="space-y-4">
              {orgMode === "idle" && (
                <div className="flex gap-4">
                   <button onClick={() => setOrgMode("create")} className="py-2.5 px-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm font-medium hover:bg-white/[0.08]">Create Organization</button>
                   <button onClick={() => setOrgMode("join")} className="py-2.5 px-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm font-medium hover:bg-white/[0.08]">Join Organization</button>
                </div>
              )}

              {orgMode !== "idle" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {orgMode === "create" && (
                     <div>
                       <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Organization Name</label>
                       <input type="text" value={orgForm.orgName} onChange={(e) => setOrgForm({ ...orgForm, orgName: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                     </div>
                   )}
                   <div>
                     <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Company Domain</label>
                     <input type="text" value={orgForm.domain} onChange={(e) => setOrgForm({ ...orgForm, domain: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                   </div>
                   <div>
                     <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Role</label>
                     <select value={orgForm.role} onChange={(e) => setOrgForm({ ...orgForm, role: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none">
                       <option value="CFO">CFO</option>
                       <option value="MANAGER">MANAGER</option>
                       <option value="EMPLOYEE">EMPLOYEE</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Position / Title</label>
                     <input type="text" value={orgForm.position} onChange={(e) => setOrgForm({ ...orgForm, position: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                   </div>

                   {/* New Detailed Organization Properties */}
                   {orgMode === "create" && (
                     <>
                        <div>
                          <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Revenue Range</label>
                          <input type="text" placeholder="e.g. $1M - $5M" value={orgForm.revenueRange} onChange={(e) => setOrgForm({ ...orgForm, revenueRange: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Funding Stage</label>
                          <input type="text" placeholder="e.g. Series A, Bootstrapped" value={orgForm.fundingStage} onChange={(e) => setOrgForm({ ...orgForm, fundingStage: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Company Type</label>
                          <select value={orgForm.companyType} onChange={(e) => setOrgForm({ ...orgForm, companyType: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none">
                            <option value="Private">Private</option>
                            <option value="Public">Public</option>
                          </select>
                        </div>
                        {orgForm.companyType === "Public" && (
                          <div>
                            <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Stock Ticker</label>
                            <input type="text" placeholder="e.g. AAPL" value={orgForm.stockTicker} onChange={(e) => setOrgForm({ ...orgForm, stockTicker: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none uppercase" />
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Headquarters</label>
                          <input type="text" placeholder="e.g. San Francisco, US" value={orgForm.headquarters} onChange={(e) => setOrgForm({ ...orgForm, headquarters: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Company Size</label>
                          <input type="text" placeholder="e.g. 51-200" value={orgForm.size} onChange={(e) => setOrgForm({ ...orgForm, size: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                        </div>
                        <div className={orgForm.companyType === "Public" ? "md:col-span-1" : "md:col-span-2"}>
                          <label className="text-xs font-medium text-foreground/40 mb-1.5 block">LinkedIn URL</label>
                          <input type="url" placeholder="https://linkedin.com/company/acme" value={orgForm.linkedinUrl} onChange={(e) => setOrgForm({ ...orgForm, linkedinUrl: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                        </div>
                     </>
                   )}

                   <div className="md:col-span-2 flex gap-4 mt-2">
                     <button onClick={() => setOrgMode("idle")} className="py-2.5 px-4 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm font-medium">Cancel</button>
                     <button onClick={() => handleOrgAction(orgMode)} disabled={orgActionLoading} className="py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-medium flex-1">
                       {orgActionLoading ? "Processing..." : orgMode === "create" ? "Create Organization" : "Join Organization"}
                     </button>
                   </div>
                </div>
              )}
             </div>
           ) : myOrg ? (
             <div className="mt-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                            <Building2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {myOrg.name}
                                {myOrg.companyType && (
                                    <span className="text-xs ml-3 font-medium text-gray-400 bg-white/5 border border-white/5 px-2 py-1 rounded-md inline-flex align-middle">
                                        {myOrg.companyType} Company
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-foreground/40 mt-1">
                                Domain: {myOrg.domain} · {myOrg.users?.length} member{myOrg.users?.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => {
                            setEditOrgForm({
                                name: myOrg.name || "",
                                revenueRange: myOrg.revenueRange || "",
                                fundingStage: myOrg.fundingStage || "",
                                companyType: myOrg.companyType || "Private",
                                stockTicker: myOrg.stockTicker || "",
                                headquarters: myOrg.headquarters || "",
                                size: myOrg.size || "",
                                linkedinUrl: myOrg.linkedinUrl || "",
                            });
                            setIsEditOrgModalOpen(true);
                        }} className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-foreground/60" title="Edit Organization Details">
                            <Edit3 size={16} />
                        </button>
                        <button onClick={() => setIsDeleteOrgModalOpen(true)} className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-foreground/60" title="Leave/Delete Organization">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin size={12} /> Headquarters
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{myOrg.headquarters || "—"}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Users size={12} /> Company Size
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{myOrg.size || "—"} Employees</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <DollarSign size={12} /> Revenue Range
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{myOrg.revenueRange || "—"}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <TrendingUp size={12} /> Funding Stage
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{myOrg.fundingStage || "—"}</span>
                    </div>

                    {myOrg.companyType === "Public" && myOrg.stockTicker && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <LineChart size={12} /> Stock Ticker
                            </span>
                            <span className="text-sm text-emerald-400 font-bold tracking-wider">{myOrg.stockTicker}</span>
                        </div>
                    )}

                    {myOrg.linkedinUrl && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <ExternalLink size={12} /> Socials
                            </span>
                            <a 
                                href={myOrg.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 break-all"
                            >
                                LinkedIn Profile
                            </a>
                        </div>
                    )}
                </div>
             </div>
           ) : (
                <div className="text-sm text-foreground/60 w-full flex items-center justify-center p-6">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
           )}
        </div>
      </div>

      {/* Edit Organization Modal */}
      {isEditOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                <h3 className="text-lg font-bold text-foreground">Edit Organization Details</h3>
                <button onClick={() => setIsEditOrgModalOpen(false)} className="text-foreground/50 hover:text-foreground">
                   <X size={20} />
                </button>
            </div>
            <form onSubmit={handleEditOrg} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Organization Name</label>
                  <input type="text" placeholder="Organization Name" value={editOrgForm.name || ""} onChange={(e) => setEditOrgForm({ ...editOrgForm, name: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Revenue Range</label>
                  <input type="text" placeholder="e.g. $1M - $5M" value={editOrgForm.revenueRange} onChange={(e) => setEditOrgForm({ ...editOrgForm, revenueRange: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Funding Stage</label>
                  <input type="text" placeholder="e.g. Series A" value={editOrgForm.fundingStage} onChange={(e) => setEditOrgForm({ ...editOrgForm, fundingStage: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Company Type</label>
                  <select value={editOrgForm.companyType} onChange={(e) => setEditOrgForm({ ...editOrgForm, companyType: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none">
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
                {editOrgForm.companyType === "Public" && (
                  <div>
                    <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Stock Ticker</label>
                    <input type="text" placeholder="e.g. AAPL" value={editOrgForm.stockTicker} onChange={(e) => setEditOrgForm({ ...editOrgForm, stockTicker: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground uppercase focus:outline-none" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Headquarters</label>
                  <input type="text" placeholder="e.g. SF, CA" value={editOrgForm.headquarters} onChange={(e) => setEditOrgForm({ ...editOrgForm, headquarters: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">Company Size</label>
                  <input type="text" placeholder="e.g. 51-200" value={editOrgForm.size} onChange={(e) => setEditOrgForm({ ...editOrgForm, size: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/40 mb-1.5 block">LinkedIn URL</label>
                  <input type="url" placeholder="https://linkedin.com/..." value={editOrgForm.linkedinUrl} onChange={(e) => setEditOrgForm({ ...editOrgForm, linkedinUrl: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none" />
                </div>
                <div className="flex gap-4 pt-4 mt-4 border-t border-white/[0.06]">
                  <button type="button" onClick={() => setIsEditOrgModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium transition-all">Cancel</button>
                  <button type="submit" disabled={editOrgLoading} className="flex-1 py-3 rounded-xl bg-primary hover:bg-orange-600 text-white text-sm font-semibold transition-all disabled:opacity-50 blur-0">
                    {editOrgLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOrgModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-[#0a0a0a] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Leave Organization?</h3>
              <p className="text-sm text-foreground/60 mb-6">
                 Are you sure you want to leave {myOrg?.name}? If you are the last member, this organization will be permanently deleted.
              </p>
              <div className="flex gap-3">
                 <button onClick={() => setIsDeleteOrgModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm font-medium transition-all">Cancel</button>
                 <button onClick={handleDeleteOrg} disabled={deleteOrgLoading} className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 text-sm font-semibold transition-all disabled:opacity-50">
                   {deleteOrgLoading ? "Leaving..." : "Leave"}
                 </button>
              </div>
           </div>
         </div>
      )}

    </div>
  );
}
