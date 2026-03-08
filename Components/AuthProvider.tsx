"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("finora_token");
    const savedUser = localStorage.getItem("finora_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api<{ status: string; data: { user: User } }>(
        "/auth/me",
        { token }
      );
      setUser(res.data.user);
      localStorage.setItem("finora_user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api<{
      status: string;
      data: { user: User; accessToken: string };
    }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    setToken(res.data.accessToken);
    setUser(res.data.user);
    localStorage.setItem("finora_token", res.data.accessToken);
    localStorage.setItem("finora_user", JSON.stringify(res.data.user));
  };

  const register = async (regData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => {
    const res = await api<{
      status: string;
      data: { user: User; accessToken: string };
    }>("/auth/register", {
      method: "POST",
      body: regData,
    });

    setToken(res.data.accessToken);
    setUser(res.data.user);
    localStorage.setItem("finora_token", res.data.accessToken);
    localStorage.setItem("finora_user", JSON.stringify(res.data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("finora_token");
    localStorage.removeItem("finora_user");
  };

  const updateProfile = async (profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    if (!token) throw new Error("Not authenticated");
    const res = await api<{ status: string; data: { user: User } }>(
      "/auth/update-profile",
      {
        method: "PATCH",
        token,
        body: profileData,
      }
    );

    setUser(res.data.user);
    localStorage.setItem("finora_user", JSON.stringify(res.data.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
