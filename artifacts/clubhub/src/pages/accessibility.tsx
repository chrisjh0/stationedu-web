import { Link } from "wouter";

const CONTACT_EMAIL = "27cho@athenian.org";
const REVIEW_DATE = "September 14, 2026";

function StationMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="168 161.5 473 473" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        d="M193,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z M354,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z"
        fill="var(--primary)"
      />
      <circle cx="405" cy="263" r="58.5" fill="var(--accent)" />
    </svg>
  );
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 16,
  color: "var(--heading)",
  letterSpacing: "-0.01em",
  margin: "0 0 8px",
};

const bodyStyle: React.CSSProperties = {
  fontSize: 14.5,
  lineHeight: 1.7,
  color: "var(--text-2)",
  margin: 0,
};

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  textDecoration: "underline",
  textUnderlineOffset: 2,
};

export default function AccessibilityPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Minimal header */}
      <header style={{
        background: "var(--primary)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StationMark size={24} />
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 17,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}>
            Station
          </span>
        </div>
        <Link href="/login">
          <a style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            textDecoration: "none",
            fontFamily: "var(--font-body)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            ← Back to sign in
          </a>
        </Link>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "52px 32px 80px", maxWidth: 760, marginLeft: "auto", marginRight: "auto", width: "100%" }}>
        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-3)",
            marginBottom: 12,
          }}>
            Legal
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 38px)",
            color: "var(--heading)",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            margin: "0 0 14px",
          }}>
            Accessibility Statement
          </h1>
          <p style={{ ...bodyStyle, maxWidth: "52ch" }}>
            Station is committed to making our platform accessible to everyone, including people with disabilities.
          </p>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "var(--text-3)",
            marginTop: 10,
          }}>
            Last reviewed: {REVIEW_DATE}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Section 1 */}
          <section aria-labelledby="a11y-commitment">
            <h2 id="a11y-commitment" style={sectionHeadingStyle}>Our Commitment</h2>
            <p style={bodyStyle}>
              Station Education is committed to ensuring digital accessibility for people with disabilities. We continually
              improve the user experience for everyone and apply the relevant accessibility standards so that our platform
              works for all students, club leaders, and school administrators.
            </p>
          </section>

          {/* Section 2 */}
          <section aria-labelledby="a11y-conformance">
            <h2 id="a11y-conformance" style={sectionHeadingStyle}>Conformance Status</h2>
            <p style={bodyStyle}>
              We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>. These
              guidelines explain how to make web content more accessible to people with disabilities. Conformance with
              these guidelines helps make the web more user-friendly for all people.
            </p>
            <p style={{ ...bodyStyle, marginTop: 10 }}>
              Station is <em>partially conformant</em> with WCAG 2.1 Level AA. We are actively working to address all
              known gaps.
            </p>
          </section>

          {/* Section 3 */}
          <section aria-labelledby="a11y-tech">
            <h2 id="a11y-tech" style={sectionHeadingStyle}>Technical Specifications</h2>
            <p style={bodyStyle}>
              Accessibility of Station relies on the following technologies to work with your browser and any assistive
              technologies or plugins installed:
            </p>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 5 }}>
              {["HTML", "CSS", "JavaScript", "WAI-ARIA"].map(t => (
                <li key={t} style={bodyStyle}>{t}</li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section aria-labelledby="a11y-compat">
            <h2 id="a11y-compat" style={sectionHeadingStyle}>Compatibility with Browsers and Assistive Technology</h2>
            <p style={bodyStyle}>Station is designed to be compatible with the following assistive technologies:</p>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Screen readers (including NVDA, JAWS, and VoiceOver)",
                "Keyboard-only navigation",
                "Browser zoom up to 200% without loss of content or functionality",
                "High-contrast display modes",
              ].map(item => (
                <li key={item} style={bodyStyle}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 5 */}
          <section aria-labelledby="a11y-limitations">
            <h2 id="a11y-limitations" style={sectionHeadingStyle}>Known Limitations</h2>
            <p style={bodyStyle}>
              Despite our best efforts, there may be some limitations. We are aware of the following issues and are
              working to resolve them:
            </p>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                "Some older PDF documents linked from the platform may not be fully accessible.",
                "Certain rich data visualizations may not have complete text alternatives for screen reader users.",
                "Some dialog components may not fully announce dynamic content updates to assistive technologies.",
              ].map(item => (
                <li key={item} style={bodyStyle}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Section 6 */}
          <section aria-labelledby="a11y-request">
            <h2 id="a11y-request" style={sectionHeadingStyle}>Requesting Accessible Content</h2>
            <p style={bodyStyle}>
              If you need information from our platform in a different accessible format — such as large print, audio
              description, or easy-read language — please contact us using the details below. We will respond within
              5 business days.
            </p>
          </section>

          {/* Section 7 */}
          <section aria-labelledby="a11y-contact">
            <h2 id="a11y-contact" style={sectionHeadingStyle}>Feedback and Contact</h2>
            <p style={bodyStyle}>
              We welcome your feedback on the accessibility of Station. If you experience any accessibility barriers,
              please contact us:
            </p>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
              <li style={bodyStyle}>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
            <p style={{ ...bodyStyle, marginTop: 10 }}>
              We try to respond to accessibility feedback within 5 business days.
            </p>
          </section>

          {/* Section 8 */}
          <section aria-labelledby="a11y-complaints">
            <h2 id="a11y-complaints" style={sectionHeadingStyle}>Formal Complaints</h2>
            <p style={bodyStyle}>
              If you are not satisfied with our response to your accessibility concern, you may contact the relevant
              supervisory authority in your jurisdiction. In the United States, you may file a complaint with the
              U.S. Department of Justice's Civil Rights Division or the U.S. Access Board.
            </p>
            <p style={{ ...bodyStyle, marginTop: 10 }}>
              We are committed to engaging constructively with all accessibility concerns and treating every complaint
              as an opportunity to improve.
            </p>
          </section>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "20px 32px", flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text-3)", margin: 0 }}>© 2026 Station Education, Inc.</p>
          <span style={{ display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            <Link href="/privacy"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Privacy</a></Link>
            <Link href="/terms"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Terms</a></Link>
            <Link href="/cookies"><a style={{ color: "var(--text-3)", textDecoration: "none" }}>Cookies</a></Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
