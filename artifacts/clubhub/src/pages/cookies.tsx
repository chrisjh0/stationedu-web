import { useEffect } from "react";
import { Link } from "wouter";

const CONTACT = "27cho@athenian.org";
const UPDATED = "September 14, 2026";

function StationMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="168 161.5 473 473" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" d="M193,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z M354,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z" fill="var(--primary)" />
      <circle cx="405" cy="263" r="58.5" fill="var(--accent)" />
    </svg>
  );
}

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
  color: "var(--heading)", letterSpacing: "-0.01em", margin: "0 0 8px",
};
const pStyle: React.CSSProperties = {
  fontSize: 14.5, lineHeight: 1.7, color: "var(--text-2)", margin: "0 0 8px",
};
const liStyle: React.CSSProperties = {
  fontSize: 14.5, lineHeight: 1.65, color: "var(--text-2)",
};
const aStyle: React.CSSProperties = {
  color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: 2,
};
const ulStyle: React.CSSProperties = {
  margin: "0 0 8px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 5,
};

const thStyle: React.CSSProperties = {
  background: "var(--surface-2)", textAlign: "left", padding: "9px 12px",
  fontWeight: 600, fontSize: 13, color: "var(--heading)",
  border: "1px solid var(--border)", fontFamily: "var(--font-body)",
};
const tdStyle: React.CSSProperties = {
  padding: "9px 12px", fontSize: 13.5, color: "var(--text-2)",
  border: "1px solid var(--border)", verticalAlign: "top",
};

export default function CookiesPage() {
  useEffect(() => { document.title = "Cookie Policy — Station"; }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: "var(--primary)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StationMark size={24} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>Station</span>
        </div>
        <Link href="/login">
          <a style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontFamily: "var(--font-body)" }}>← Back to sign in</a>
        </Link>
      </header>

      <main style={{ flex: 1, padding: "52px 32px 80px", maxWidth: 760, marginLeft: "auto", marginRight: "auto", width: "100%" }}>
        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 12 }}>Legal</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px, 4vw, 38px)", color: "var(--heading)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: "0 0 10px" }}>Cookie Policy</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", margin: "0 0 14px" }}>Last updated: {UPDATED}</p>
          <p style={{ ...pStyle, maxWidth: "52ch" }}>
            This policy explains how Station uses cookies and similar browser storage technologies.
          </p>
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 36, fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)" }}>
          <strong style={{ color: "var(--heading)" }}>Draft notice:</strong> This is a draft document. It should be reviewed by a qualified attorney before being relied upon for legal compliance.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          <section aria-labelledby="ck-what">
            <h2 id="ck-what" style={h2Style}>1. What Are Cookies?</h2>
            <p style={pStyle}>Cookies are small text files that a website stores on your device when you visit. They are widely used to make websites work efficiently, remember your preferences, and provide information to site operators. Cookies are sent back to the originating website on subsequent visits.</p>
            <p style={pStyle}>In addition to cookies, websites can use similar technologies like <strong style={{ color: "var(--heading)" }}>localStorage</strong> — a browser feature that stores data locally on your device but, unlike cookies, is not automatically sent to the server with each request. This policy covers both cookies and localStorage.</p>
          </section>

          <section aria-labelledby="ck-storage">
            <h2 id="ck-storage" style={h2Style}>2. Storage Technologies We Use</h2>
            <p style={pStyle}>We reviewed the full Station codebase and found the following storage technologies in use:</p>
            <div style={{ overflowX: "auto", marginTop: 12, marginBottom: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Purpose</th>
                    <th style={thStyle}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdStyle}><code>clubhub_token</code></td>
                    <td style={tdStyle}>localStorage</td>
                    <td style={tdStyle}>Stores your JSON Web Token (JWT) to keep you logged in. This token identifies your account and is sent with API requests. Without it, you would need to sign in on every visit.</td>
                    <td style={tdStyle}>Until you sign out or clear browser storage</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ ...pStyle, marginTop: 10 }}>
              <strong style={{ color: "var(--heading)" }}>Station does not use any analytics, advertising, or tracking cookies.</strong> We conducted a thorough review of the Station codebase and found no third-party analytics tools (such as Google Analytics, Mixpanel, Plausible, or similar services). The only storage technology Station itself sets is the authentication token described above.
            </p>
          </section>

          <section aria-labelledby="ck-google">
            <h2 id="ck-google" style={h2Style}>3. Third-Party Cookies (Google Sign-In)</h2>
            <p style={pStyle}>Station uses <strong style={{ color: "var(--heading)" }}>Google Sign-In (OAuth 2.0)</strong> for authentication. When you click "Sign in with Google," Google may set its own cookies on your device as part of the authentication flow. These cookies are governed by <a href="https://policies.google.com/technologies/cookies" style={aStyle} target="_blank" rel="noopener noreferrer">Google's Cookie Policy</a> and are outside of our control.</p>
            <p style={pStyle}>Station does not set any other third-party cookies. No advertising networks, social media trackers, or data brokers set cookies through Station.</p>
          </section>

          <section aria-labelledby="ck-choices">
            <h2 id="ck-choices" style={h2Style}>4. Your Choices</h2>
            <p style={pStyle}><strong style={{ color: "var(--heading)" }}>Managing the Station authentication token:</strong></p>
            <p style={pStyle}>The <code>clubhub_token</code> stored in your browser's localStorage is essential for Station to function — without it, you cannot stay signed in. You can remove it at any time by:</p>
            <ul style={ulStyle}>
              <li style={liStyle}>Clicking "Sign out" within the Station application (the recommended method)</li>
              <li style={liStyle}>Clearing your browser's site data or localStorage for <code>app.stationforedu.com</code> in your browser settings</li>
            </ul>
            <p style={{ ...pStyle, marginTop: 10 }}>Note that clearing this token will sign you out of Station immediately.</p>

            <p style={{ ...pStyle, marginTop: 14 }}><strong style={{ color: "var(--heading)" }}>Managing Google's cookies:</strong></p>
            <p style={pStyle}>You can manage Google's cookies through your browser settings or at <a href="https://myaccount.google.com/data-and-privacy" style={aStyle} target="_blank" rel="noopener noreferrer">Google's account privacy settings</a>. Restricting Google's cookies may affect your ability to sign in to Station.</p>

            <p style={{ ...pStyle, marginTop: 14 }}><strong style={{ color: "var(--heading)" }}>Browser cookie settings:</strong></p>
            <p style={pStyle}>Most browsers allow you to view, block, or delete cookies and clear localStorage. Refer to your browser's help documentation for instructions:</p>
            <ul style={ulStyle}>
              <li style={liStyle}><a href="https://support.google.com/chrome/answer/95647" style={aStyle} target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li style={liStyle}><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" style={aStyle} target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li style={liStyle}><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" style={aStyle} target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
              <li style={liStyle}><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" style={aStyle} target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </section>

          <section aria-labelledby="ck-changes">
            <h2 id="ck-changes" style={h2Style}>5. Changes to This Policy</h2>
            <p style={pStyle}>We may update this Cookie Policy from time to time. If we add new cookies or storage technologies, we will update this page and the "Last updated" date above. Continued use of Station after changes are posted constitutes acceptance of the updated Policy.</p>
          </section>

          <section aria-labelledby="ck-contact">
            <h2 id="ck-contact" style={h2Style}>6. Contact</h2>
            <p style={pStyle}>Questions about this Cookie Policy? Contact:</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong style={{ color: "var(--heading)" }}>Christopher Ho</strong></li>
              <li style={liStyle}>Email: <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a></li>
            </ul>
          </section>

        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "20px 32px", flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", margin: 0 }}>© 2026 Station Education, Inc.</p>
          <span style={{ display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            <Link href="/privacy"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Privacy</a></Link>
            <Link href="/terms"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Terms</a></Link>
            <Link href="/accessibility"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Accessibility</a></Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
