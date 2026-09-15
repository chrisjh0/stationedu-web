import { Link } from "wouter";

export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "20px 32px",
      marginTop: "auto",
    }}>
      <div style={{
        maxWidth: 1140,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
        color: "var(--text-3)",
      }}>
        <span>© 2026 Station Education, Inc.</span>
        <span style={{ display: "flex", gap: 16 }}>
          <Link href="/accessibility">
            <a style={{ color: "var(--text-3)", textDecoration: "none" }}>Accessibility</a>
          </Link>
          <a href="https://stationforedu.com/privacy" style={{ color: "var(--text-3)", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Privacy</a>
          <a href="https://stationforedu.com/terms" style={{ color: "var(--text-3)", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Terms</a>
        </span>
      </div>
    </footer>
  );
}
