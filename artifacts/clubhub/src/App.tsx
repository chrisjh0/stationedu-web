import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { NavBar } from "@/components/NavBar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/components/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

import Login from "@/pages/login";
import CalendarPage from "@/pages/calendar";
import ClubsPage from "@/pages/clubs";
import LeadershipPage from "@/pages/leadership";
import DirectoryPage from "@/pages/directory";
import SettingsPage from "@/pages/settings";
import AdminPage from "@/pages/admin";
import AccessibilityPage from "@/pages/accessibility";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import CookiesPage from "@/pages/cookies";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401 — expired token should redirect to login, not loop
        const e = error as { status?: number };
        if (e?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

function AdminGuard({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user && !user.is_admin) {
      setLocation("/calendar");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user || !user.is_admin) return null;
  return <Component />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <NavBar />
        {/* Main content — offset by sidebar width on desktop */}
        <div
          className="flex-1 flex flex-col min-h-screen"
          style={{ marginLeft: 0 }}
        >
          <style>{`@media (min-width: 768px) { .sidebar-offset { margin-left: 180px; } }`}</style>
          <main
            className="sidebar-offset flex-1"
            style={{ background: "var(--bg)", padding: "28px 32px", minHeight: "100vh" }}
          >
            <ErrorBoundary>
              <Component />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

function AdminRoute() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <NavBar />
        <div className="flex-1 flex flex-col min-h-screen">
          <style>{`@media (min-width: 768px) { .sidebar-offset { margin-left: 180px; } }`}</style>
          <main
            className="sidebar-offset flex-1"
            style={{ background: "var(--bg)", padding: "28px 32px", minHeight: "100vh" }}
          >
            <ErrorBoundary>
              <AdminGuard component={AdminPage} />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/accessibility" component={AccessibilityPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/">
        <Redirect to="/calendar" />
      </Route>
      <Route path="/calendar">
        <ProtectedRoute component={CalendarPage} />
      </Route>
      <Route path="/clubs">
        <ProtectedRoute component={ClubsPage} />
      </Route>
      <Route path="/leadership">
        <ProtectedRoute component={LeadershipPage} />
      </Route>
      <Route path="/directory">
        <ProtectedRoute component={DirectoryPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/admin">
        <AdminRoute />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
