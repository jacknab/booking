import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { saveCrewToken, getCrewToken, clearCrewToken, saveCrewData, clearCrewData } from "@/src/lib/storage";
import { crewPost } from "@/src/lib/api";

export interface CrewUser {
  id: number;
  name: string;
  color: string;
  storeId: number;
  phone: string | null;
}

interface AuthState {
  user: CrewUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CrewUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getCrewToken();
        if (storedToken) {
          setToken(storedToken);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, pin: string) => {
    const result = await crewPost<{ token: string; crew: CrewUser }>("/api/crew/login", { phone, pin });
    setToken(result.token);
    setUser(result.crew);
    await saveCrewToken(result.token);
    await saveCrewData(result.crew);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearCrewToken();
    await clearCrewData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
