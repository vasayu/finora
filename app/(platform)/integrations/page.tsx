"use client";

import React from "react";
import Image from "next/image";
import { Plug, CheckCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Integration Types
type IntegrationStatus = "CONNECTED" | "DISCONNECTED" | "PENDING";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: IntegrationStatus;
}

// Dummy Integrations Data mapped to local uploaded assets
const CRM_INTEGRATIONS: Integration[] = [
  { id: "salesforce", name: "Salesforce", logo: "/salesforce.png", description: "Sync contacts and deals natively.", status: "DISCONNECTED" },
  { id: "hubspot", name: "HubSpot", logo: "/hubspot.png", description: "Automate inbound marketing workflows.", status: "DISCONNECTED" },
  { id: "zoho", name: "Zoho CRM", logo: "/zohocrm.png", description: "Connect your global sales pipeline.", status: "DISCONNECTED" },
  { id: "pipedrive", name: "Pipedrive", logo: "/pipedrive.png", description: "Track your sales activities effortlessly.", status: "DISCONNECTED" },
  { id: "copper", name: "Copper", logo: "/copper.png", description: "Google Workspace embedded CRM.", status: "DISCONNECTED" },
];

const BANK_INTEGRATIONS: Integration[] = [
  { id: "chase", name: "Chase Bank", logo: "/chasebank.png", description: "Sync corporate checking and credit.", status: "DISCONNECTED" },
  { id: "bofa", name: "Bank of America", logo: "/bankofamerica.png", description: "Import daily transaction feeds.", status: "DISCONNECTED" },
  { id: "wellsfargo", name: "Wells Fargo", logo: "/wellsfargo.png", description: "Connect commercial banking records.", status: "DISCONNECTED" },
  { id: "capitalone", name: "Capital One", logo: "/capitalone.png", description: "Automated spark business integrations.", status: "DISCONNECTED" },
  { id: "bob", name: "Bank of Baroda", logo: "/bob.png", description: "Commercial enterprise banking sync.", status: "DISCONNECTED" },
  { id: "hdfc", name: "HDFC Bank", logo: "/hdfc.png", description: "Connect corporate accounts natively.", status: "DISCONNECTED" },
  { id: "sbi", name: "State Bank of India", logo: "/sbi.png", description: "Wholesale banking integrations.", status: "DISCONNECTED" },
  { id: "stripe", name: "Stripe", logo: "/stripe.png", description: "Real-time payment gateway syncing.", status: "DISCONNECTED" },
];

export default function IntegrationsPage() {
  
  // Renders a single Integration Card
  const IntegrationCard = ({ item, index }: { item: Integration; index: number }) => {
    const isConnected = item.status === "CONNECTED";
    const isPending = item.status === "PENDING";

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="group relative flex flex-col p-5 rounded-2xl border border-white/[0.06] bg-[#0a0a0a] hover:bg-white/[0.02] hover:border-white/[0.15] transition-all overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            {/* Logo fetched from local public assets */}
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm border border-white/[0.1]">
              <Image
                src={item.logo}
                alt={`${item.name} logo`}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div>
              <h3 className="font-bold text-foreground text-sm tracking-tight">{item.name}</h3>
              <p className="text-xs text-foreground/40 mt-0.5 line-clamp-1">{item.description}</p>
            </div>
          </div>

          {/* Status Indicator */}
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider">ACTIVE</span>
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-400 tracking-wider">SYNCING</span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between relative z-10">
          {isConnected ? (
             <button className="text-xs font-semibold text-foreground/40 hover:text-red-400 transition-colors">
               Disconnect
             </button>
          ) : (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm font-semibold text-foreground transition-colors w-full justify-center border border-white/[0.04]">
              <Plug size={14} />
              Connect
            </button>
          )}

          {isConnected && (
            <button className="p-2 rounded-lg hover:bg-white/[0.04] text-foreground/40 hover:text-foreground transition-colors">
              <ExternalLink size={16} />
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrations</h1>
          <p className="text-sm text-foreground/50 mt-1">
            Connect Finora with your favorite ecosystems to automate your financial workflows.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* CRM Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">CRM & Sales</h2>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CRM_INTEGRATIONS.map((item, idx) => (
              <IntegrationCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        </section>

        {/* Banking Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Banking & Finance</h2>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {BANK_INTEGRATIONS.map((item, idx) => (
              <IntegrationCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
