"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  BarChart3,
  ShieldAlert,
  Bot,
  User,
  LogOut,
  Box,
  TrendingUp,
  Scale,
  Activity,
  Briefcase,
  Calculator,
  Crown,
  Users,
  PieChart,
  Building2,
  ChevronLeft,
  ChevronRight,
  Blocks,
} from "lucide-react";
import { useAuth } from "@/Components/AuthProvider";

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

// Navigation items per role
const ALL_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER"] },
  { label: "Documents", href: "/documents", icon: FileText, roles: ["ACCOUNTANT", "CFO", "MANAGER", "EMPLOYEE"] },
  { label: "Alerts", href: "/alerts", icon: ShieldAlert, roles: ["ACCOUNTANT", "CFO", "MANAGER"] },
  { label: "P&L Report", href: "/reports/pnl", icon: TrendingUp, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Balance Sheet", href: "/reports/balance-sheet", icon: Scale, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Trading Terminal", href: "/terminal", icon: Activity, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "AI Assistant", href: "/ai", icon: Bot, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Integrations", href: "/integrations", icon: Blocks, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Organization", href: "/organization", icon: Building2, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Profile", href: "/profile", icon: User, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  // Handle legacy roles from older database schema
  const currentRole = user?.role || "EMPLOYEE";
  const effectiveRole = ["USER", "ADMIN", "SUPER_ADMIN"].includes(currentRole) 
    ? "EMPLOYEE" 
    : currentRole;

  const roleConfig = ROLE_CONFIG[effectiveRole] || ROLE_CONFIG["EMPLOYEE"];
  const RoleIcon = roleConfig?.icon || Briefcase;

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.roles.includes(effectiveRole)) return false;
    return true;
  });

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col z-40 transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Logo Section */}
      <div className={`px-6 py-5 border-b border-white/[0.06] flex items-center relative ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
          <div className="text-primary group-hover:scale-110 transition-transform shrink-0">
            <Box size={22} />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap transition-all duration-300 opacity-100">
              Finora
            </span>
          )}
        </Link>
        
        <button 
          onClick={onToggle}
          className={`p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-foreground/50 hover:text-foreground transition-all flex items-center justify-center
            ${isCollapsed 
              ? "absolute -right-3 top-6 bg-[#0a0a0a] shadow-xl z-50 rounded-full border-white/10 w-6 h-6" 
              : "w-8 h-8"
            }`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground/50 hover:text-foreground hover:bg-white/[0.04]"
                } ${isCollapsed ? "justify-center px-0 mx-2" : ""}`}
            >
              <item.icon size={18} className="shrink-0" />
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-all duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className={`px-3 py-4 border-t border-white/[0.06] ${isCollapsed ? "flex flex-col items-center gap-2" : ""}`}>
        <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? "justify-center px-0" : "mb-2"}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-foreground/40 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        
        {/* Role Badge */}
        {!isCollapsed && roleConfig && (
          <div
            className={`flex items-center gap-2 px-3 py-2 mb-2 rounded-xl transition-opacity duration-300 ${roleConfig.bg}`}
          >
            <RoleIcon size={14} className={roleConfig.color} />
            <span className={`text-xs font-semibold ${roleConfig.color}`}>
              {roleConfig.label}
            </span>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full ${isCollapsed ? "justify-center px-0" : ""}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span className="transition-opacity duration-300">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
