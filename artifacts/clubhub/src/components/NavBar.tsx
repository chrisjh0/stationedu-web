import { Link, useLocation } from "wouter";
import { useAuth } from "./AuthContext";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function NavBar() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    { href: "/calendar", label: "Calendar" },
    { href: "/clubs", label: "Your Clubs" },
    { href: "/leadership", label: "Leadership Hub" },
    { href: "/directory", label: "Directory" },
  ];

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-16 bg-white/70 backdrop-blur-[20px] rounded-full shadow-sm z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
          C
        </div>
        <span className="font-semibold text-lg hidden md:block">ClubHub</span>
      </div>

      <nav className="hidden md:flex items-center gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              location === link.href 
                ? "bg-primary/10 text-primary" 
                : "text-secondary hover:bg-secondary/10 hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button className="text-secondary hover:text-foreground w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary/10 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <Link href="/settings" className="flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <Avatar className="w-9 h-9 border border-outline-variant/30">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {user.full_name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
