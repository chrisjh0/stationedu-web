import { useEffect } from 'react'
import LogoMark from '../components/LogoMark'

const CONTACT = '27cho@athenian.org'
const UPDATED = 'September 14, 2026'

const css = `
  .lp-wrap { max-width: 760px; margin: 0 auto; padding: 0 44px; }
  @media (max-width: 820px) { .lp-wrap { padding: 0 24px; } }
  @media (max-width: 480px) { .lp-wrap { padding: 0 16px; } }
  .lp-sec { margin-bottom: 36px; }
  .lp-sec h2 {
    font-family: 'Schibsted Grotesk', system-ui, sans-serif;
    font-size: 18px; font-weight: 700; color: #121726;
    letter-spacing: -0.01em; margin: 0 0 10px;
  }
  .lp-sec p { font-size: 15px; line-height: 1.7; color: #4C5567; margin: 0 0 10px; }
  .lp-sec ul, .lp-sec ol {
    margin: 0 0 10px; padding-left: 22px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .lp-sec li { font-size: 15px; line-height: 1.65; color: #4C5567; }
  .lp-sec a { color: #C04A40; text-decoration: underline; text-underline-offset: 2px; }
  .lp-sec a:hover { color: #A83B33; }
  .lp-sec strong { color: #121726; font-weight: 600; }
  .lp-divider { border: none; border-top: 1px solid #ECEAE4; margin: 0 0 36px; }
  .lp-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 10px; }
  .lp-table th { background: #F0F0ED; text-align: left; padding: 10px 12px; font-weight: 600; color: #121726; border: 1px solid #DDDCD8; }
  .lp-table td { padding: 10px 12px; color: #4C5567; border: 1px solid #DDDCD8; vertical-align: top; }
`

function Header() {
  return (
    <header style={{ borderBottom: '1px solid #E1E5EE', background: '#FCFCFB' }}>
      <div className="lp-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }} aria-label="Station — back to home">
          <LogoMark size={28} />
          <span style={{ fontFamily: '"Schibsted Grotesk", system-ui, sans-serif', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', color: '#121726' }}>Station</span>
        </a>
        <a href="/" style={{ fontSize: 13.5, color: '#4C5567', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
      </div>
    </header>
  )
}

function PageFooter() {
  return (
    <footer style={{ borderTop: '1px solid #ECEAE4', background: '#F7F7F5', padding: '24px 0' }}>
      <div className="lp-wrap">
        <p style={{ fontSize: 13, color: '#4C5567', margin: 0, fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
          © 2026 Station Education, Inc. ·{' '}
          <a href="/privacy" style={{ color: '#4C5567' }}>Privacy</a> ·{' '}
          <a href="/terms" style={{ color: '#4C5567' }}>Terms</a> ·{' '}
          <a href="/accessibility" style={{ color: '#4C5567' }}>Accessibility</a>
        </p>
      </div>
    </footer>
  )
}

export default function Cookies() {
  useEffect(() => { document.title = 'Cookie Policy — Station' }, [])

  return (
    <>
      <style>{css}</style>
      <Header />

      <main style={{ padding: '60px 0 80px', background: '#FCFCFB' }}>
        <div className="lp-wrap">
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C6478', display: 'inline-block', marginBottom: 14 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: '"Schibsted Grotesk", system-ui, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#121726', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 12px' }}>
            Cookie Policy
          </h1>
          <p style={{ fontSize: 14, color: '#5C6478', marginBottom: 8, fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
            Last updated: {UPDATED}
          </p>
          <p style={{ fontSize: 15, color: '#4C5567', lineHeight: 1.7, maxWidth: '60ch', marginBottom: 40 }}>
            This policy explains how Station uses cookies and similar browser storage technologies.
          </p>

          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5C6478', background: '#F0F0ED', border: '1px solid #DDDCD8', borderRadius: 8, padding: '14px 18px', marginBottom: 40 }}>
            <strong style={{ color: '#121726' }}>Draft notice:</strong> This is a draft document prepared for review. It should be reviewed by a qualified attorney before being relied upon for legal compliance.
          </p>

          <hr className="lp-divider" />

          {/* Section 1 */}
          <div className="lp-sec">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that a website stores on your device when you visit. They are widely used to make websites work efficiently, remember your preferences, and provide information to site operators. Cookies are sent back to the originating website on subsequent visits.
            </p>
            <p>
              In addition to cookies, websites can use similar technologies like <strong>localStorage</strong> — a browser feature that stores data locally on your device but, unlike cookies, is not automatically sent to the server with each request. This policy covers both cookies and localStorage.
            </p>
          </div>

          {/* Section 2 */}
          <div className="lp-sec">
            <h2>2. Storage Technologies We Use</h2>
            <p>
              We reviewed the full Station codebase and found the following storage technologies in use:
            </p>

            <table className="lp-table" style={{ marginTop: 14 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>clubhub_token</code></td>
                  <td>localStorage</td>
                  <td>Stores your JSON Web Token (JWT) to keep you logged in. This token identifies your account and is sent with API requests. Without it, you would need to sign in on every visit.</td>
                  <td>Until you sign out or clear browser storage</td>
                </tr>
              </tbody>
            </table>

            <p style={{ marginTop: 14 }}>
              <strong>Station does not use any analytics, advertising, or tracking cookies.</strong> We conducted a thorough review of the Station codebase — including both <code>index.html</code> files and all source code — and found no third-party analytics tools (such as Google Analytics, Mixpanel, Plausible, or similar services). The only storage technology Station itself sets is the authentication token described above.
            </p>
          </div>

          {/* Section 3 */}
          <div className="lp-sec">
            <h2>3. Third-Party Cookies (Google Sign-In)</h2>
            <p>
              Station uses <strong>Google Sign-In (OAuth 2.0)</strong> for authentication. When you click "Sign in with Google," Google may set its own cookies on your device as part of the authentication flow. These cookies are governed by <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">Google's Cookie Policy</a> and are outside of our control.
            </p>
            <p>
              Station does not set any other third-party cookies. No advertising networks, social media trackers, or data brokers set cookies through Station.
            </p>
          </div>

          {/* Section 4 */}
          <div className="lp-sec">
            <h2>4. Your Choices</h2>
            <p><strong>Managing the Station authentication token:</strong></p>
            <p>
              The <code>clubhub_token</code> stored in your browser's localStorage is essential for Station to function — without it, you cannot stay signed in. You can remove it at any time by:
            </p>
            <ul>
              <li>Clicking "Sign out" within the Station application (the recommended method)</li>
              <li>Clearing your browser's site data or localStorage for <code>app.stationforedu.com</code> in your browser settings</li>
            </ul>
            <p style={{ marginTop: 10 }}>
              Note that clearing this token will sign you out of Station immediately.
            </p>

            <p style={{ marginTop: 14 }}><strong>Managing Google's cookies:</strong></p>
            <p>
              You can manage Google's cookies through your browser settings or at <a href="https://myaccount.google.com/data-and-privacy" target="_blank" rel="noopener noreferrer">Google's account privacy settings</a>. Restricting Google's cookies may affect your ability to sign in to Station.
            </p>

            <p style={{ marginTop: 14 }}><strong>Browser cookie settings:</strong></p>
            <p>
              Most browsers allow you to view, block, or delete cookies and clear localStorage. Refer to your browser's help documentation for instructions:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="lp-sec">
            <h2>5. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. If we add new cookies or storage technologies, we will update this page and the "Last updated" date above. Continued use of Station after changes are posted constitutes acceptance of the updated Policy.
            </p>
          </div>

          {/* Section 6 */}
          <div className="lp-sec">
            <h2>6. Contact</h2>
            <p>Questions about this Cookie Policy? Contact:</p>
            <ul>
              <li><strong>Christopher Ho</strong></li>
              <li>Email: <a href={`mailto:${CONTACT}`}>{CONTACT}</a></li>
              <li>Website: <a href="https://stationforedu.com" target="_blank" rel="noopener noreferrer">stationforedu.com</a></li>
            </ul>
          </div>
        </div>
      </main>

      <PageFooter />
    </>
  )
}
