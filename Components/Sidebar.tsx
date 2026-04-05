"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  ShieldAlert,
  Bot,
  User,
  LogOut,
  Box,
  TrendingUp,
  Scale,
  Briefcase,
  Calculator,
  Crown,
  Users,
  PieChart,
  Building2,
  Blocks,
  Newspaper,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/Components/AuthProvider";

const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: LucideIcon }
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
  { label: "Market News", href: "/news", icon: Newspaper, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "AI Assistant", href: "/ai", icon: Bot, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Integrations", href: "/integrations", icon: Blocks, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Organization", href: "/organization", icon: Building2, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
  { label: "Profile", href: "/profile", icon: User, roles: ["EMPLOYEE", "ACCOUNTANT", "CFO", "MANAGER", "INVESTOR"] },
];

export default function Sidebar() {
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
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/6 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="text-primary group-hover:scale-110 transition-transform">
            <Box size={22} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Finora
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground/50 hover:text-foreground hover:bg-white/4"
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-white/6">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-foreground/40 truncate">{user?.email}</p>
          </div>
        </div>
        {/* Role Badge */}
        {roleConfig && (
          <div
            className={`flex items-center gap-2 px-3 py-2 mb-2 rounded-xl ${roleConfig.bg}`}
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
