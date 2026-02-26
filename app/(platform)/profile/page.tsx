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
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, fetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
      </div>
    </div>
  );
}
