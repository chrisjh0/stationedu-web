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

export default function TermsPage() {
  useEffect(() => { document.title = "Terms of Service — Station"; }, []);

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
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px, 4vw, 38px)", color: "var(--heading)", letterSpacing: "-0.025em", lineHeight: 1.1, margin: "0 0 10px" }}>Terms of Service</h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", margin: "0 0 14px" }}>Last updated: {UPDATED}</p>
          <p style={{ ...pStyle, maxWidth: "52ch" }}>
            These Terms of Service govern your use of Station. By using Station, you agree to these Terms.
          </p>
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 18px", marginBottom: 36, fontSize: 13.5, lineHeight: 1.6, color: "var(--text-2)" }}>
          <strong style={{ color: "var(--heading)" }}>Draft notice:</strong> This is a draft document. It should be reviewed by a qualified attorney before being relied upon for legal compliance.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          <section aria-labelledby="tos-accept">
            <h2 id="tos-accept" style={h2Style}>1. Acceptance of Terms</h2>
            <p style={pStyle}>By accessing or using Station (at <strong style={{ color: "var(--heading)" }}>stationforedu.com</strong> or <strong style={{ color: "var(--heading)" }}>app.stationforedu.com</strong>), you agree to be bound by these Terms of Service and our <a href="/privacy" style={aStyle}>Privacy Policy</a>. If you do not agree to these Terms, do not use Station.</p>
            <p style={pStyle}>You must be at least <strong style={{ color: "var(--heading)" }}>13 years old</strong> to use Station. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.</p>
          </section>

          <section aria-labelledby="tos-service">
            <h2 id="tos-service" style={h2Style}>2. Description of Service</h2>
            <p style={pStyle}>Station is a student club management platform that enables students to discover and join clubs and organizations, view club events on a shared calendar, receive notifications about club activities, and for club leaders to manage their clubs, schedule events, and communicate with members.</p>
            <p style={pStyle}>Station is operated by <strong style={{ color: "var(--heading)" }}>Christopher Ho</strong>, an individual based in California, United States. Contact: <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
          </section>

          <section aria-labelledby="tos-accounts">
            <h2 id="tos-accounts" style={h2Style}>3. User Accounts</h2>
            <p style={pStyle}>To use Station, you must sign in using your school Google account. By doing so:</p>
            <ul style={ulStyle}>
              {[
                "You confirm that the account you use belongs to you",
                "You are responsible for maintaining the confidentiality and security of your account",
                "You must not share your account credentials or allow others to access Station using your account",
                "You must not create accounts on behalf of other people without their explicit consent",
                "You are responsible for all activity that occurs under your account",
              ].map(s => <li key={s} style={liStyle}>{s}</li>)}
            </ul>
            <p style={{ ...pStyle, marginTop: 10 }}>If you suspect unauthorized access to your account, contact us immediately at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
          </section>

          <section aria-labelledby="tos-use">
            <h2 id="tos-use" style={h2Style}>4. Acceptable Use</h2>
            <p style={pStyle}>You agree to use Station only for lawful purposes and in a manner that does not infringe the rights of others. You agree not to:</p>
            <ul style={ulStyle}>
              {[
                "Use Station for any illegal purpose or in violation of any local, state, national, or international law",
                "Harass, bully, intimidate, or harm other users",
                "Post or share false, misleading, defamatory, or inappropriate content",
                "Impersonate any person, club, or organization",
                "Attempt to gain unauthorized access to any part of Station, its servers, or any connected systems",
                "Use Station to send spam, unsolicited messages, or chain letters",
                "Scrape, crawl, copy, or redistribute Station's content or data without permission",
                "Interfere with or disrupt the integrity or performance of Station",
                "Upload or transmit malware, viruses, or any other malicious code",
              ].map(s => <li key={s} style={liStyle}>{s}</li>)}
            </ul>
            <p style={{ ...pStyle, marginTop: 10 }}>We reserve the right to remove any content that violates these Terms and to terminate accounts that engage in prohibited conduct.</p>
          </section>

          <section aria-labelledby="tos-leader">
            <h2 id="tos-leader" style={h2Style}>5. Club Leader Responsibilities</h2>
            <p style={pStyle}>If you use Station as a club leader or administrator, you accept additional responsibilities:</p>
            <ul style={ulStyle}>
              {[
                "Ensuring that your club's profile information (description, meeting times, location) is accurate and current",
                "Ensuring your club's activities comply with your school's policies and these Terms",
                "Using event scheduling, member management, and notification features appropriately and in the interest of your club members",
                "Not using your admin access to collect or misuse information about other users",
              ].map(s => <li key={s} style={liStyle}>{s}</li>)}
            </ul>
          </section>

          <section aria-labelledby="tos-ip">
            <h2 id="tos-ip" style={h2Style}>6. Intellectual Property</h2>
            <p style={pStyle}>Station and its content, features, code, design, and functionality are owned by Christopher Ho and are protected by applicable intellectual property laws. The Station name, logo, and brand elements are proprietary.</p>
            <p style={pStyle}>You may not copy, modify, distribute, sell, or create derivative works based on Station or its content without prior written permission from Christopher Ho.</p>
            <p style={pStyle}>You retain ownership of any content you submit to Station (such as club descriptions or event details). By submitting content, you grant Christopher Ho a non-exclusive, royalty-free license to use, display, and store that content for the purpose of operating Station.</p>
          </section>

          <section aria-labelledby="tos-warranty">
            <h2 id="tos-warranty" style={h2Style}>7. Disclaimer of Warranties</h2>
            <p style={pStyle}>Station is provided <strong style={{ color: "var(--heading)" }}>"as is"</strong> and <strong style={{ color: "var(--heading)" }}>"as available"</strong> without warranties of any kind, express or implied. To the fullest extent permitted by law, Christopher Ho disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
            <p style={pStyle}>We do not warrant that:</p>
            <ul style={ulStyle}>
              {[
                "Station will be available at all times or without interruption",
                "Station will be error-free or free of viruses or other harmful components",
                "The results obtained from using Station will be accurate or reliable",
              ].map(s => <li key={s} style={liStyle}>{s}</li>)}
            </ul>
          </section>

          <section aria-labelledby="tos-liability">
            <h2 id="tos-liability" style={h2Style}>8. Limitation of Liability</h2>
            <p style={pStyle}>To the maximum extent permitted by California law, Christopher Ho shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, Station. This includes but is not limited to loss of data, loss of goodwill, or business interruption.</p>
            <p style={pStyle}>In no event shall Christopher Ho's total liability to you for all claims arising from or related to Station exceed the greater of (a) the amount you paid to use Station in the twelve months preceding the claim (if any), or (b) one hundred dollars ($100).</p>
          </section>

          <section aria-labelledby="tos-termination">
            <h2 id="tos-termination" style={h2Style}>9. Termination</h2>
            <p style={pStyle}>We reserve the right to suspend or permanently terminate your access to Station at any time and for any reason, including but not limited to violation of these Terms, without prior notice and without liability to you.</p>
            <p style={pStyle}>You may stop using Station at any time. You may request deletion of your account by contacting us at <a href={`mailto:${CONTACT}`} style={aStyle}>{CONTACT}</a>.</p>
            <p style={pStyle}>Sections of these Terms that by their nature should survive termination (including but not limited to intellectual property, disclaimers, limitation of liability, and governing law) will survive termination.</p>
          </section>

          <section aria-labelledby="tos-law">
            <h2 id="tos-law" style={h2Style}>10. Governing Law and Dispute Resolution</h2>
            <p style={pStyle}>These Terms are governed by and construed in accordance with the laws of the <strong style={{ color: "var(--heading)" }}>State of California</strong>, without regard to its conflict of law provisions.</p>
            <p style={pStyle}>Any disputes arising from or relating to these Terms or your use of Station shall be subject to the exclusive jurisdiction of the state and federal courts located in California. You consent to the personal jurisdiction of those courts.</p>
          </section>

          <section aria-labelledby="tos-changes">
            <h2 id="tos-changes" style={h2Style}>11. Changes to These Terms</h2>
            <p style={pStyle}>We may update these Terms of Service at any time. When we make material changes, we will notify you by email or by posting a notice in the Station application. The "Last updated" date at the top of this page reflects the most recent revision.</p>
            <p style={pStyle}>Your continued use of Station after changes to these Terms constitutes your acceptance of the updated Terms.</p>
          </section>

          <section aria-labelledby="tos-contact">
            <h2 id="tos-contact" style={h2Style}>12. Contact</h2>
            <p style={pStyle}>Questions about these Terms? Contact:</p>
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
            <Link href="/cookies"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Cookies</a></Link>
            <Link href="/accessibility"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Accessibility</a></Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
