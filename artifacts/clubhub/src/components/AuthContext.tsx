import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  graduation_year?: number | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("clubhub_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: userData, isLoading: isUserLoading, isError } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      enabled: !!token,
      retry: false,
    }
  });

  const [user, setLocalUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (userData?.success && userData.user) {
      setLocalUser(userData.user as UserProfile);
    }
  }, [userData]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (newToken: string) => {
    localStorage.setItem("clubhub_token", newToken);
    setToken(newToken);
    setLocation("/calendar");
  };

  const logout = () => {
    localStorage.removeItem("clubhub_token");
    setToken(null);
    setLocalUser(null);
    queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
    setLocation("/login");
  };

  const setUser = (newUser: UserProfile) => {
    setLocalUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: !!token && isUserLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
