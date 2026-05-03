import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../components/AuthContext";
import { Button } from "../components/ui/button";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@school.edu";
const APP_NAME = import.meta.env.VITE_APP_NAME || "ClubHub";

const ERROR_MESSAGES: Record<string, string> = {
  domain: "Your email domain is not allowed. Please use your school email address.",
  oauth_not_configured: "Google sign-in is not configured. Contact your administrator.",
  oauth_failed: "Sign-in failed. Please try again.",
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, login } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const errorKey = params.get("error");
  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.oauth_failed) : null;

  useEffect(() => {
    if (token) {
      login(token);
    }
  }, [token, login]);

  useEffect(() => {
    if (user) {
      setLocation("/calendar");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FB] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0px_10px_30px_rgba(15,23,42,0.04)] p-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl mb-6 shadow-lg shadow-primary/20">
          C
        </div>

        <h1 className="text-3xl font-bold font-lexend text-center text-on-surface mb-2">{APP_NAME}</h1>
        <p className="text-secondary text-center mb-8">Welcome to your campus hub.</p>

        {errorMessage && (
          <div className="w-full mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[18px] flex-shrink-0 mt-0.5">error</span>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <Button
          className="w-full h-12 text-base rounded-full bg-gradient-to-r from-primary to-primary-container hover:opacity-90 shadow-md shadow-primary/20 transition-all text-white"
          onClick={() => { window.location.href = "/api/auth/google/login"; }}
        >
          <span className="material-symbols-outlined mr-2">login</span>
          Sign in with Google
        </Button>

        <p className="mt-10 text-xs text-secondary/70 text-center">
          Having trouble signing in? <br />
          Contact <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </div>
  );
}
