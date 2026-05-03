import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
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

  // Derive user directly from query data — no separate local state needed.
  const user = userData?.success && userData.user ? (userData.user as UserProfile) : null;

  const logout = useCallback(() => {
    localStorage.removeItem("clubhub_token");
    setToken(null);
    queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
    setLocation("/login");
  }, [queryClient, setLocation]);

  // Side-effect: when the /user/me query fails (expired token, revoked session),
  // clear auth state and redirect to login. logout() is a stable useCallback —
  // calling it from an effect is the correct React pattern here; the rule fires
  // only because logout internally calls setToken, which is indirect, not a
  // direct data-sync setState in the effect body.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isError) logout();
  }, [isError, logout]);

  const login = (newToken: string) => {
    localStorage.setItem("clubhub_token", newToken);
    setToken(newToken);
    setLocation("/calendar");
  };

  // Write the updated profile directly into the query cache so the navbar
  // reflects the change immediately without waiting for a refetch.
  const setUser = (newUser: UserProfile) => {
    queryClient.setQueryData(getGetCurrentUserQueryKey(), { success: true, user: newUser });
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
