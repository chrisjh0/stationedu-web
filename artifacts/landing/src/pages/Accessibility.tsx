import { useEffect } from 'react'
import LogoMark from '../components/LogoMark'

const CONTACT_EMAIL = '27cho@athenian.org'
const REVIEW_DATE = 'September 14, 2026'

export default function Accessibility() {
  useEffect(() => { document.title = 'Accessibility — Station'; }, [])
  return (
    <>
      <style>{`
        .a11y-wrap { max-width: 760px; margin: 0 auto; padding: 0 44px; }
        @media (max-width: 820px) { .a11y-wrap { padding: 0 24px; } }
        @media (max-width: 480px) { .a11y-wrap { padding: 0 16px; } }
        .a11y-section { margin-bottom: 40px; }
        .a11y-section h2 {
          font-family: 'Schibsted Grotesk', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #121726;
          letter-spacing: -0.01em;
          margin: 0 0 10px;
        }
        .a11y-section p, .a11y-section li {
          font-size: 15px;
          line-height: 1.7;
          color: #4C5567;
        }
        .a11y-section ul {
          margin: 8px 0 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .a11y-section a {
          color: #C04A40;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .a11y-section a:hover { color: #A83B33; }
      `}</style>

      {/* Simple nav */}
      <header style={{
        borderBottom: '1px solid #E1E5EE',
        background: '#FCFCFB',
        padding: '0',
      }}>
        <div className="a11y-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <a
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}
            aria-label="Station — back to home"
          >
            <LogoMark size={28} />
            <span style={{
              fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 19,
              letterSpacing: '-0.02em',
              color: '#121726',
            }}>
              Station
            </span>
          </a>
          <a
            href="/"
            style={{
              fontSize: 13.5,
              color: '#4C5567',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            ← Back to home
          </a>
        </div>
      </header>

      <main style={{ padding: '60px 0 96px', background: '#FCFCFB' }}>
        <div className="a11y-wrap">
          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <span style={{
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#5C6478',
              display: 'inline-block',
              marginBottom: 14,
            }}>
              Legal
            </span>
            <h1 style={{
              fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: '#121726',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              margin: '0 0 16px',
            }}>
              Accessibility Statement
            </h1>
            <p style={{ fontSize: 15, color: '#4C5567', lineHeight: 1.7, maxWidth: '56ch' }}>
              Station is committed to making our platform accessible to everyone, including people with disabilities.
            </p>
            <p style={{ fontSize: 13, color: '#5C6478', marginTop: 10 }}>
              Last reviewed: {REVIEW_DATE}
            </p>
          </div>

          {/* Section 1 — Our commitment */}
          <div className="a11y-section">
            <h2>Our Commitment</h2>
            <p>
              Station Education is committed to ensuring digital accessibility for people with disabilities. We continually
              improve the user experience for everyone and apply the relevant accessibility standards so that our platform
              works for all students, club leaders, and school administrators.
            </p>
          </div>

          {/* Section 2 — Conformance status */}
          <div className="a11y-section">
            <h2>Conformance Status</h2>
            <p>
              We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>. These
              guidelines explain how to make web content more accessible to people with disabilities. Conformance with
              these guidelines helps make the web more user-friendly for all people.
            </p>
            <p style={{ marginTop: 10 }}>
              Station is <em>partially conformant</em> with WCAG 2.1 Level AA. Partial conformance means that some parts
              of the content do not fully conform to the accessibility standard. We are actively working to address all
              known gaps.
            </p>
          </div>

          {/* Section 3 — Technical specifications */}
          <div className="a11y-section">
            <h2>Technical Specifications</h2>
            <p>
              Accessibility of Station relies on the following technologies to work with the particular combination of
              web browser and any assistive technologies or plugins installed on your computer:
            </p>
            <ul>
              <li>HTML</li>
              <li>CSS</li>
              <li>JavaScript</li>
              <li>WAI-ARIA</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              These technologies are relied upon for conformance with the accessibility standards used.
            </p>
          </div>

          {/* Section 4 — Supported technologies */}
          <div className="a11y-section">
            <h2>Compatibility with Browsers and Assistive Technology</h2>
            <p>
              Station is designed to be compatible with the following assistive technologies:
            </p>
            <ul>
              <li>Screen readers (including NVDA, JAWS, and VoiceOver)</li>
              <li>Keyboard-only navigation</li>
              <li>Browser zoom up to 200% without loss of content or functionality</li>
              <li>High-contrast display modes</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              We recommend using a modern browser (Chrome, Firefox, Safari, or Edge) for the best experience.
            </p>
          </div>

          {/* Section 5 — Known limitations */}
          <div className="a11y-section">
            <h2>Known Limitations</h2>
            <p>
              Despite our best efforts to ensure accessibility of Station, there may be some limitations. We are aware of
              the following known issues and are working to resolve them:
            </p>
            <ul>
              <li>Some older PDF documents linked from the platform may not be fully accessible.</li>
              <li>Certain rich data visualizations may not have complete text alternatives for screen reader users.</li>
              <li>Some dialog components may not fully announce dynamic content updates to assistive technologies.</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              We apologize for any inconvenience. Please{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>contact us</a>{' '}
              if you encounter an issue not listed here.
            </p>
          </div>

          {/* Section 6 — How to request accessible content */}
          <div className="a11y-section">
            <h2>Requesting Accessible Content</h2>
            <p>
              If you need information from our platform in a different accessible format — such as large print, audio
              description, or easy-read language — please contact us using the details below. We will respond within
              5 business days with the content in your preferred format or with an explanation if we are unable to
              provide it.
            </p>
          </div>

          {/* Section 7 — Feedback and contact */}
          <div className="a11y-section">
            <h2>Feedback and Contact</h2>
            <p>
              We welcome your feedback on the accessibility of Station. If you experience any accessibility barriers,
              please contact us:
            </p>
            <ul>
              <li>
                Email:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
            <p style={{ marginTop: 10 }}>
              We try to respond to accessibility feedback within 5 business days.
            </p>
          </div>

          {/* Section 8 — Formal complaints */}
          <div className="a11y-section">
            <h2>Formal Complaints</h2>
            <p>
              If you are not satisfied with our response to your accessibility concern, you may contact the relevant
              supervisory authority in your jurisdiction. In the United States, you may file a complaint with the
              U.S. Department of Justice's Civil Rights Division or the U.S. Access Board.
            </p>
            <p style={{ marginTop: 10 }}>
              We are committed to engaging constructively with all accessibility concerns and treating every complaint
              as an opportunity to improve.
            </p>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer style={{ borderTop: '1px solid #ECEAE4', background: '#F7F7F5', padding: '24px 0' }}>
        <div className="a11y-wrap">
          <p style={{ fontSize: 13, color: '#4C5567', margin: 0 }}>
            © 2026 Station Education, Inc. ·{' '}
            <a href="/privacy" style={{ color: '#4C5567' }}>Privacy</a> ·{' '}
            <a href="/terms" style={{ color: '#4C5567' }}>Terms</a>
          </p>
        </div>
      </footer>
    </>
  )
}
