import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../components/AuthContext";
import { Button } from "../components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      login(token);
    }
  }, [login]);

  useEffect(() => {
    if (user) {
      setLocation("/calendar");
    }
  }, [user, setLocation]);

  const handleDevLogin = async () => {
    try {
      const res = await fetch("/api/auth/dev-login");
      const data = await res.json();
      if (data.token) {
        login(data.token);
      }
    } catch {
      // dev login failed silently
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FB] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_10px_30px_rgba(15,23,42,0.04)] p-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-lg shadow-primary/20">
          C
        </div>
        
        <h1 className="text-3xl font-bold text-center text-on-surface mb-2">ClubHub</h1>
        <p className="text-secondary text-center mb-10">Welcome to your campus hub.</p>

        <div className="w-full flex flex-col gap-4">
          <Button 
            className="w-full h-12 text-base rounded-full bg-gradient-to-r from-primary to-primary-container hover:opacity-90 shadow-md shadow-primary/20 transition-all text-white"
            onClick={() => { window.location.href = "/api/auth/google/login"; }}
          >
            <span className="material-symbols-outlined mr-2">login</span>
            Sign in with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary text-xs font-medium uppercase tracking-wider">OR FOR DEVELOPMENT</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 text-base rounded-full border-outline-variant text-secondary hover:bg-secondary/5"
            onClick={handleDevLogin}
          >
            Dev Login Bypass
          </Button>
        </div>

        <p className="mt-10 text-xs text-secondary/70 text-center">
          Having trouble signing in? <br/> Contact <a href="mailto:support@school.edu" className="text-primary hover:underline">support@school.edu</a>
        </p>
      </div>
    </div>
  );
}
