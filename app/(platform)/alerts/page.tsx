"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { api } from "@/lib/api";
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function AlertsPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api("/alerts", { token });
        const list = res.data?.alerts || res.data || [];
        setAlerts(Array.isArray(list) ? list : []);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [token]);

  const getAlertIcon = (type: string) => {
    if (type === "fraud")
      return <AlertTriangle size={16} className="text-red-400" />;
    if (type === "anomaly")
      return <ShieldAlert size={16} className="text-amber-400" />;
    return <Info size={16} className="text-blue-400" />;
  };

  const getAlertBg = (type: string) => {
    if (type === "fraud") return "bg-red-500/10 border-red-500/20";
    if (type === "anomaly") return "bg-amber-500/10 border-amber-500/20";
    return "bg-blue-500/10 border-blue-500/20";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-foreground/50 text-sm mt-1">
          Fraud detection and anomaly alerts
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-16 text-center">
          <CheckCircle size={48} className="text-emerald-400/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            All Clear
          </h2>
          <p className="text-foreground/40 text-sm">
            No alerts or anomalies detected. Your finances look healthy.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-2xl p-5 ${getAlertBg(alert.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                      {alert.type}
                    </span>
                    <span className="text-xs text-foreground/40">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
