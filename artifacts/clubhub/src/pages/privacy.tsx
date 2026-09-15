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

export default function PrivacyPage() {
  useEffect(() => { document.title = "Privacy Policy — Station"; }, []);

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
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px, 4vw, 38px)", color: "var(--heading)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: "0 0 10px" }}>Privacy Policy</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", margin: "0 0 14px" }}>Last updated: {UPDATED}</p>
          <p style={{ ...pStyle, maxWidth: "52ch" }}>
            This Privacy Policy explains how Christopher Ho, operating Station, collects, uses, and protects information about you.
          </p>
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 36, fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)" }}>
          <strong style={{ color: "var(--heading)" }}>Draft notice:</strong> This is a draft document. It should be reviewed by a qualified attorney before being relied upon for legal compliance.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          <section aria-labelledby="priv-intro">
            <h2 id="priv-intro" style={h2Style}>1. Introduction</h2>
            <p style={pStyle}>Station is a student club management platform operated by <strong style={{ color: "var(--heading)" }}>Christopher Ho</strong>, an individual based in California, United States.</p>
            <p style={pStyle}>This Privacy Policy applies to the Station website at <strong style={{ color: "var(--heading)" }}>stationforedu.com</strong> and the web application at <strong style={{ color: "var(--heading)" }}>app.stationforedu.com</strong>. By using Station, you agree to the practices described here.</p>
            <p style={pStyle}>Questions? Contact us at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
          </section>

          <section aria-labelledby="priv-collect">
            <h2 id="priv-collect" style={h2Style}>2. Information We Collect</h2>
            <p style={pStyle}><strong style={{ color: "var(--heading)" }}>From Google Sign-In (OAuth):</strong></p>
            <ul style={ulStyle}>{["Your name, as it appears in your Google account", "Your email address", "Your Google profile photo (if one exists)"].map(s => <li key={s} style={liStyle}>{s}</li>)}</ul>
            <p style={{ ...pStyle, marginTop: 10 }}><strong style={{ color: "var(--heading)" }}>Club and activity data:</strong></p>
            <ul style={ulStyle}>{["Which clubs and organizations you join or follow", "Events you mark as attending", "Leadership roles you hold in clubs", "Notifications you send or receive in connection with club activities"].map(s => <li key={s} style={liStyle}>{s}</li>)}</ul>
            <p style={{ ...pStyle, marginTop: 10 }}><strong style={{ color: "var(--heading)" }}>Account preferences:</strong></p>
            <ul style={ulStyle}>{["Notification settings (email notifications, event reminders, weekly digest)", "Privacy settings (profile visibility, membership visibility)", "Profile information you update in Settings"].map(s => <li key={s} style={liStyle}>{s}</li>)}</ul>
            <p style={{ ...pStyle, marginTop: 10 }}><strong style={{ color: "var(--heading)" }}>Usage data collected automatically:</strong></p>
            <ul style={ulStyle}>{["Pages and features you use within Station", "Actions such as enrolling in a club or viewing an event", "Your browser type and approximate location derived from IP address", "Log data including access times and error reports"].map(s => <li key={s} style={liStyle}>{s}</li>)}</ul>
            <p style={{ ...pStyle, marginTop: 10 }}><strong style={{ color: "var(--heading)" }}>No third-party analytics:</strong> Station does not use any third-party analytics services. No tracking scripts are present in the codebase. Usage data is collected only by our own servers.</p>
          </section>

          <section aria-labelledby="priv-use">
            <h2 id="priv-use" style={h2Style}>3. How We Use Your Information</h2>
            <ul style={ulStyle}>
              {[
                "Provide the Station service — displaying clubs, calendar, events, and your profile",
                "Authenticate you via Google Sign-In and maintain your session",
                "Send email notifications about club events (only if you opt in via Settings)",
                "Display your profile to other Station users at your school, per your privacy settings",
                "Improve Station by understanding how features are used",
                "Communicate with you about service changes or security issues",
              ].map(s => <li key={s} style={liStyle}>{s}</li>)}
            </ul>
            <p style={pStyle}><strong style={{ color: "var(--heading)" }}>We do not sell your personal information</strong> to any third party. <strong style={{ color: "var(--heading)" }}>We do not use your information for advertising.</strong></p>
          </section>

          <section aria-labelledby="priv-share">
            <h2 id="priv-share" style={h2Style}>4. Information Sharing</h2>
            <ul style={ulStyle}>
              <li style={liStyle}><strong style={{ color: "var(--heading)" }}>Google:</strong> We use Google OAuth for authentication. Google's use of your information is governed by <a href="https://policies.google.com/privacy" style={aStyle} target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
              <li style={liStyle}><strong style={{ color: "var(--heading)" }}>Supabase:</strong> Your data is stored in a database hosted by Supabase, Inc., which processes data on our behalf and is contractually prohibited from using it for other purposes.</li>
              <li style={liStyle}><strong style={{ color: "var(--heading)" }}>School administrators:</strong> Club leaders and admins with Station admin access can see club membership and event data, but not your private account settings.</li>
              <li style={liStyle}><strong style={{ color: "var(--heading)" }}>Legal requirements:</strong> We may disclose information if required by law or to protect the safety of any person.</li>
            </ul>
            <p style={pStyle}>We do not share your personal information with any other third parties.</p>
          </section>

          <section aria-labelledby="priv-ferpa">
            <h2 id="priv-ferpa" style={h2Style}>5. FERPA Notice</h2>
            <p style={pStyle}>To the extent that Station handles "education records" as defined by the Family Educational Rights and Privacy Act (FERPA), 20 U.S.C. § 1232g, we handle such records in accordance with FERPA requirements and only as directed by the educational institution.</p>
            <p style={pStyle}>Students and parents with FERPA-related requests may contact us at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
          </section>

          <section aria-labelledby="priv-coppa">
            <h2 id="priv-coppa" style={h2Style}>6. Children's Privacy (COPPA)</h2>
            <p style={pStyle}>Station is intended for users who are at least <strong style={{ color: "var(--heading)" }}>13 years old</strong>. We do not knowingly collect personal information from children under 13. If you are under 13, please do not use Station.</p>
            <p style={pStyle}>If we learn that we have collected information from a child under 13, we will delete it promptly. Parents may contact us at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
          </section>

          <section aria-labelledby="priv-ccpa">
            <h2 id="priv-ccpa" style={h2Style}>7. California Privacy Rights (CCPA/CPRA)</h2>
            <p style={pStyle}>California residents have the right to know what personal information we collect, request deletion or correction of their data, opt out of sale (we do not sell data), and not be discriminated against for exercising these rights.</p>
            <p style={pStyle}>To exercise these rights, contact us at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>. We will respond to verified requests within 45 days.</p>
          </section>

          <section aria-labelledby="priv-security">
            <h2 id="priv-security" style={h2Style}>8. Data Security</h2>
            <ul style={ulStyle}>{["Encrypted data transmission via HTTPS on all pages", "Secure authentication via Google OAuth (we never store your Google password)", "Access controls limiting who can access user data", "Database-level security rules enforced through Supabase"].map(s => <li key={s} style={liStyle}>{s}</li>)}</ul>
            <p style={pStyle}>No system is completely secure. If you believe your account has been compromised, contact us immediately at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
          </section>

          <section aria-labelledby="priv-retention">
            <h2 id="priv-retention" style={h2Style}>9. Data Retention</h2>
            <p style={pStyle}>We retain your account information for as long as your account is active. You may request deletion of your account and all associated data by emailing <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a> with subject "Account Deletion Request." We will delete your data within <strong style={{ color: "var(--heading)" }}>30 days</strong> of verifying your identity, except where required by law.</p>
          </section>

          <section aria-labelledby="priv-changes">
            <h2 id="priv-changes" style={h2Style}>10. Changes to This Policy</h2>
            <p style={pStyle}>We may update this Privacy Policy from time to time. Significant changes will be communicated by email or in-app notice. Your continued use of Station after changes constitutes acceptance of the updated Policy.</p>
          </section>

          <section aria-labelledby="priv-contact">
            <h2 id="priv-contact" style={h2Style}>11. Contact</h2>
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
            <Link href="/terms"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Terms</a></Link>
            <Link href="/cookies"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Cookies</a></Link>
            <Link href="/accessibility"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Accessibility</a></Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
