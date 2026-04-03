"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import {
    Building2,
    Plus,
    KeyRound,
    Copy,
    Check,
    Users,
    Crown,
    Briefcase,
    Calculator,
    PieChart,
    Sparkles,
    MapPin,
    TrendingUp,
    DollarSign,
    ExternalLink,
    LineChart
} from "lucide-react";

const ROLE_CONFIG: Record<
    string,
    { label: string; color: string; bg: string; icon: any }
> = {
    EMPLOYEE: {
        label: "Employee",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        icon: Briefcase,
    },
    ACCOUNTANT: {
        label: "Accountant",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        icon: Calculator,
    },
    CFO: {
        label: "CFO",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        icon: Crown,
    },
    MANAGER: {
        label: "Manager",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        icon: Users,
    },
    INVESTOR: {
        label: "Investor",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        icon: PieChart,
    },
};

interface OrgMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    position: string;
    createdAt: string;
}

interface Organization {
    id: string;
    name: string;
    domain: string;
    inviteCode: string;
    ownerId: string;
    users: OrgMember[];
    createdAt: string;
    revenueRange?: string;
    fundingStage?: string;
    companyType?: string;
    stockTicker?: string;
    headquarters?: string;
    size?: string;
    linkedinUrl?: string;
}

export default function OrganizationPage() {
    const { user, token, fetchProfile } = useAuth();
    const [org, setOrg] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [copied, setCopied] = useState(false);

    // Form states
    const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
    const [orgName, setOrgName] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [domain, setDomain] = useState("");
    const [role, setRole] = useState("EMPLOYEE");
    const [position, setPosition] = useState("");

    const fetchOrg = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api<{
                status: string;
                data: { organization: Organization | null };
            }>("/organizations/my-org", { token });
            setOrg(res.data.organization);
        } catch {
            setOrg(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOrg();
    }, [fetchOrg]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setActionLoading(true);
        try {
            const res = await api<{
                status: string;
                data: { organization: Organization };
            }>("/organizations", {
                method: "POST",
                token,
                body: { name: orgName, domain, role, position },
            });
            setOrg(res.data.organization);
            setSuccess("Organization created successfully!");
            setMode("idle");
            setOrgName("");
            setDomain("");
            setPosition("");
            setRole("EMPLOYEE");
            await fetchProfile();
        } catch (err: any) {
            setError(err.message || "Failed to create organization");
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setActionLoading(true);
        try {
            const res = await api<{
                status: string;
                data: { organization: Organization };
            }>("/organizations/join", {
                method: "POST",
                token,
                body: { inviteCode: inviteCode.trim(), domain, role, position },
            });
            setOrg(res.data.organization);
            setSuccess("Joined organization successfully!");
            setMode("idle");
            setInviteCode("");
            setDomain("");
            setPosition("");
            setRole("EMPLOYEE");
            await fetchProfile();
        } catch (err: any) {
            setError(err.message || "Failed to join organization");
        } finally {
            setActionLoading(false);
        }
    };

    const copyCode = () => {
        if (!org) return;
        navigator.clipboard.writeText(org.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Group members by role
    const membersByRole = org?.users.reduce(
        (acc, member) => {
            const role = member.role || "EMPLOYEE";
            if (!acc[role]) acc[role] = [];
            acc[role].push(member);
            return acc;
        },
        {} as Record<string, OrgMember[]>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // ─── No Organization State ─────────────────────────────────────
    if (!org) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Organization</h1>
                    <p className="text-foreground/50 text-sm mt-1">
                        dont or join an organization to collaborate with your team
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                        <p className="text-emerald-400 text-sm">{success}</p>
                    </div>
                )}

                {mode === "idle" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                        {/* Create Card */}
                        <button
                            onClick={() => setMode("create")}
                            className="group bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-8 text-left hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Create Organization
                            </h3>
                            <p className="text-sm text-foreground/40 leading-relaxed">
                                Start a new organization and invite your team members using a
                                unique invite code.
                            </p>
                        </button>

                        {/* Join Card */}
                        <button
                            onClick={() => setMode("join")}
                            className="group bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-8 text-left hover:border-emerald-500/30 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <KeyRound size={24} className="text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Join Organization
                            </h3>
                            <p className="text-sm text-foreground/40 leading-relaxed">
                                Enter an invite code shared by your organization admin to join
                                an existing team.
                            </p>
                        </button>
                    </div>
                )}

                {/* Create Form */}
                {mode === "create" && (
                    <div className="max-w-md">
                        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Plus size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">
                                        Create Organization
                                    </h3>
                                    <p className="text-xs text-foreground/40">
                                        Give your organization a name
                                    </p>
                                </div>
                            </div>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                        placeholder="Acme Corp"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                        Organization Domain
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                        placeholder="acme.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                            Your Role
                                        </label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="CFO">CFO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                            Position/Title
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                            placeholder="e.g. Senior Analyst"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("idle");
                                            setError("");
                                        }}
                                        className="flex-1 py-3 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-orange-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {actionLoading ? "Creating..." : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Join Form */}
                {mode === "join" && (
                    <div className="max-w-md">
                        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <KeyRound size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">
                                        Join Organization
                                    </h3>
                                    <p className="text-xs text-foreground/40">
                                        Enter the invite code from your admin
                                    </p>
                                </div>
                            </div>
                            <form onSubmit={handleJoin} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                        Invite Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono tracking-widest text-center uppercase"
                                        placeholder="ABCD1234"
                                        maxLength={8}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                        Organization Domain (Confirm)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="acme.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                            Your Role
                                        </label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all appearance-none"
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="CFO">CFO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground/60 mb-1.5 block">
                                            Position/Title
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                            placeholder="e.g. Accountant"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMode("idle");
                                            setError("");
                                        }}
                                        className="flex-1 py-3 rounded-xl text-sm font-medium text-foreground/60 hover:text-foreground bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                        {actionLoading ? "Joining..." : "Join"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Organization Panel ────────────────────────────────────────
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Organization</h1>
                <p className="text-foreground/50 text-sm mt-1">
                    Manage your organization and team members
                </p>
            </div>

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
                    <p className="text-emerald-400 text-sm">{success}</p>
                </div>
            )}

            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 mb-6 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                            <Building2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {org.name}
                                {org.companyType && (
                                    <span className="text-xs ml-3 font-medium text-gray-400 bg-white/5 border border-white/5 px-2 py-1 rounded-md inline-flex align-middle">
                                        {org.companyType} Company
                                    </span>
                                )}
                            </h2>
                            <p className="text-sm text-foreground/40 mt-1">
                                Domain: {org.domain} · {org.users.length} member{org.users.length !== 1 ? "s" : ""} ·
                                Created{" "}
                                {new Date(org.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                    {/* Invite Code */}
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-[10px] uppercase tracking-wider text-foreground/30 font-medium">
                                Invite Code
                            </p>
                            <p className="text-base font-mono font-bold text-foreground tracking-widest">
                                {org.inviteCode}
                            </p>
                        </div>
                        <button
                            onClick={copyCode}
                            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-primary/30 hover:bg-primary/5 transition-all"
                            title="Copy invite code"
                        >
                            {copied ? (
                                <Check size={16} className="text-emerald-400" />
                            ) : (
                                <Copy size={16} className="text-foreground/50" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Organization Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <MapPin size={12} /> Headquarters
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{org.headquarters || "—"}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Users size={12} /> Company Size
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{org.size || "—"} Employees</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <DollarSign size={12} /> Revenue Range
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{org.revenueRange || "—"}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <TrendingUp size={12} /> Funding Stage
                        </span>
                        <span className="text-sm text-foreground/80 font-medium">{org.fundingStage || "—"}</span>
                    </div>

                    {org.companyType === "Public" && org.stockTicker && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <LineChart size={12} /> Stock Ticker
                            </span>
                            <span className="text-sm text-emerald-400 font-bold tracking-wider">{org.stockTicker}</span>
                        </div>
                    )}

                    {org.linkedinUrl && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <ExternalLink size={12} /> Socials
                            </span>
                            <a 
                                href={org.linkedinUrl} 
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

            {/* Members By Role */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users size={20} className="text-foreground/50" />
                    Team Members
                </h3>

                {membersByRole &&
                    Object.entries(membersByRole).map(([role, members]) => {
                        const config = ROLE_CONFIG[role] || ROLE_CONFIG.EMPLOYEE;
                        const RoleIcon = config.icon;
                        return (
                            <div key={role}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div
                                        className={`px-2.5 py-1 rounded-lg ${config.bg} flex items-center gap-1.5`}
                                    >
                                        <RoleIcon size={12} className={config.color} />
                                        <span
                                            className={`text-xs font-semibold ${config.color}`}
                                        >
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-foreground/30">
                                        {members.length}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3 hover:border-white/[0.1] transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-orange-400/80 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {member.firstName?.[0]}
                                                {member.lastName?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {member.firstName} {member.lastName}
                                                    {member.id === org.ownerId && (
                                                        <Sparkles
                                                            size={12}
                                                            className="inline ml-1.5 text-amber-400"
                                                        />
                                                    )}
                                                </p>
                                                <p className="text-xs text-foreground/40 truncate">
                                                    {member.email} · {member.position || 'No Position'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
