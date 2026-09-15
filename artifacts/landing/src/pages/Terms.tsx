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
          <a href="/cookies" style={{ color: '#4C5567' }}>Cookies</a> ·{' '}
          <a href="/accessibility" style={{ color: '#4C5567' }}>Accessibility</a>
        </p>
      </div>
    </footer>
  )
}

export default function Terms() {
  useEffect(() => { document.title = 'Terms of Service — Station' }, [])

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
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: '#5C6478', marginBottom: 8, fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
            Last updated: {UPDATED}
          </p>
          <p style={{ fontSize: 15, color: '#4C5567', lineHeight: 1.7, maxWidth: '60ch', marginBottom: 40 }}>
            These Terms of Service govern your use of Station. By using Station, you agree to these Terms.
          </p>

          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5C6478', background: '#F0F0ED', border: '1px solid #DDDCD8', borderRadius: 8, padding: '14px 18px', marginBottom: 40 }}>
            <strong style={{ color: '#121726' }}>Draft notice:</strong> This is a draft document prepared for review. It should be reviewed by a qualified attorney before being relied upon for legal compliance.
          </p>

          <hr className="lp-divider" />

          {/* Section 1 */}
          <div className="lp-sec">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Station (at <strong>stationforedu.com</strong> or <strong>app.stationforedu.com</strong>), you agree to be bound by these Terms of Service and our <a href="/privacy">Privacy Policy</a>. If you do not agree to these Terms, do not use Station.
            </p>
            <p>
              You must be at least <strong>13 years old</strong> to use Station. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.
            </p>
          </div>

          {/* Section 2 */}
          <div className="lp-sec">
            <h2>2. Description of Service</h2>
            <p>
              Station is a student club management platform that enables students to discover and join clubs and organizations, view club events on a shared calendar, receive notifications about club activities, and for club leaders to manage their clubs, schedule events, and communicate with members.
            </p>
            <p>
              Station is operated by Christopher Ho, an individual based in California, United States. Contact: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          </div>

          {/* Section 3 */}
          <div className="lp-sec">
            <h2>3. User Accounts</h2>
            <p>To use Station, you must sign in using your school Google account. By doing so:</p>
            <ul>
              <li>You confirm that the account you use belongs to you</li>
              <li>You are responsible for maintaining the confidentiality and security of your account</li>
              <li>You must not share your account credentials or allow others to access Station using your account</li>
              <li>You must not create accounts on behalf of other people without their explicit consent</li>
              <li>You are responsible for all activity that occurs under your account</li>
            </ul>
            <p style={{ marginTop: 14 }}>
              If you suspect unauthorized access to your account, contact us immediately at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          </div>

          {/* Section 4 */}
          <div className="lp-sec">
            <h2>4. Acceptable Use</h2>
            <p>You agree to use Station only for lawful purposes and in a manner that does not infringe the rights of others. You agree not to:</p>
            <ul>
              <li>Use Station for any illegal purpose or in violation of any local, state, national, or international law</li>
              <li>Harass, bully, intimidate, or harm other users</li>
              <li>Post or share false, misleading, defamatory, or inappropriate content</li>
              <li>Impersonate any person, club, or organization</li>
              <li>Attempt to gain unauthorized access to any part of Station, its servers, or any connected systems</li>
              <li>Use Station to send spam, unsolicited messages, or chain letters</li>
              <li>Scrape, crawl, copy, or redistribute Station's content or data without permission</li>
              <li>Interfere with or disrupt the integrity or performance of Station</li>
              <li>Upload or transmit malware, viruses, or any other malicious code</li>
            </ul>
            <p style={{ marginTop: 14 }}>
              We reserve the right to remove any content that violates these Terms and to terminate accounts that engage in prohibited conduct.
            </p>
          </div>

          {/* Section 5 */}
          <div className="lp-sec">
            <h2>5. Club Leader Responsibilities</h2>
            <p>If you use Station as a club leader or administrator, you accept additional responsibilities:</p>
            <ul>
              <li>Ensuring that your club's profile information (description, meeting times, location) is accurate and current</li>
              <li>Ensuring your club's activities comply with your school's policies and these Terms</li>
              <li>Using event scheduling, member management, and notification features appropriately and in the interest of your club members</li>
              <li>Not using your admin access to collect or misuse information about other users</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="lp-sec">
            <h2>6. Intellectual Property</h2>
            <p>
              Station and its content, features, code, design, and functionality are owned by Christopher Ho and are protected by applicable intellectual property laws. The Station name, logo, and brand elements are proprietary.
            </p>
            <p>
              You may not copy, modify, distribute, sell, or create derivative works based on Station or its content without prior written permission from Christopher Ho.
            </p>
            <p>
              You retain ownership of any content you submit to Station (such as club descriptions or event details). By submitting content, you grant Christopher Ho a non-exclusive, royalty-free license to use, display, and store that content for the purpose of operating Station.
            </p>
          </div>

          {/* Section 7 */}
          <div className="lp-sec">
            <h2>7. Disclaimer of Warranties</h2>
            <p>
              Station is provided <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, express or implied. To the fullest extent permitted by law, Christopher Ho disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>We do not warrant that:</p>
            <ul>
              <li>Station will be available at all times or without interruption</li>
              <li>Station will be error-free or free of viruses or other harmful components</li>
              <li>The results obtained from using Station will be accurate or reliable</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div className="lp-sec">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by California law, Christopher Ho shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, Station. This includes but is not limited to loss of data, loss of goodwill, or business interruption.
            </p>
            <p>
              In no event shall Christopher Ho's total liability to you for all claims arising from or related to Station exceed the greater of (a) the amount you paid to use Station in the twelve months preceding the claim (if any), or (b) one hundred dollars ($100).
            </p>
          </div>

          {/* Section 9 */}
          <div className="lp-sec">
            <h2>9. Termination</h2>
            <p>
              We reserve the right to suspend or permanently terminate your access to Station at any time and for any reason, including but not limited to violation of these Terms, without prior notice and without liability to you.
            </p>
            <p>
              You may stop using Station at any time. You may request deletion of your account by contacting us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
            <p>
              Sections of these Terms that by their nature should survive termination (including but not limited to intellectual property, disclaimers, limitation of liability, and governing law) will survive termination.
            </p>
          </div>

          {/* Section 10 */}
          <div className="lp-sec">
            <h2>10. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the <strong>State of California</strong>, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from or relating to these Terms or your use of Station shall be subject to the exclusive jurisdiction of the state and federal courts located in California. You consent to the personal jurisdiction of those courts.
            </p>
          </div>

          {/* Section 11 */}
          <div className="lp-sec">
            <h2>11. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service at any time. When we make material changes, we will notify you by email or by posting a notice in the Station application. The "Last updated" date at the top of this page reflects the most recent revision.
            </p>
            <p>
              Your continued use of Station after changes to these Terms constitutes your acceptance of the updated Terms.
            </p>
          </div>

          {/* Section 12 */}
          <div className="lp-sec">
            <h2>12. Contact</h2>
            <p>Questions about these Terms? Contact:</p>
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
