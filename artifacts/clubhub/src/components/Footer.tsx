export function Footer() {
  return (
    <footer className="w-full py-12 px-6 border-t border-outline-variant/20 mt-20 text-sm text-secondary">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-60">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs">
            C
          </div>
          <span className="font-semibold">ClubHub</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
        </div>
        <div className="opacity-60 text-right">
          &copy; {new Date().getFullYear()} ClubHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
