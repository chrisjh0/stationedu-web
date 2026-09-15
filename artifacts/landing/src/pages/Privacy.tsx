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
          <a href="/terms" style={{ color: '#4C5567' }}>Terms</a> ·{' '}
          <a href="/cookies" style={{ color: '#4C5567' }}>Cookies</a> ·{' '}
          <a href="/accessibility" style={{ color: '#4C5567' }}>Accessibility</a>
        </p>
      </div>
    </footer>
  )
}

export default function Privacy() {
  useEffect(() => { document.title = 'Privacy Policy — Station' }, [])

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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: '#5C6478', marginBottom: 8, fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
            Last updated: {UPDATED}
          </p>
          <p style={{ fontSize: 15, color: '#4C5567', lineHeight: 1.7, maxWidth: '60ch', marginBottom: 40 }}>
            This Privacy Policy explains how Christopher Ho, operating Station, collects, uses, and protects information about you. Please read it carefully.
          </p>

          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5C6478', background: '#F0F0ED', border: '1px solid #DDDCD8', borderRadius: 8, padding: '14px 18px', marginBottom: 40 }}>
            <strong style={{ color: '#121726' }}>Draft notice:</strong> This is a draft document prepared for review. It should be reviewed by a qualified attorney before being relied upon for legal compliance.
          </p>

          <hr className="lp-divider" />

          {/* Section 1 */}
          <div className="lp-sec">
            <h2>1. Introduction</h2>
            <p>
              Station is a student club management platform operated by <strong>Christopher Ho</strong>, an individual based in California, United States. Station allows students to discover clubs, manage memberships, view events, and for club leaders to manage their organizations.
            </p>
            <p>
              This Privacy Policy applies to the Station website at <strong>stationforedu.com</strong> and the web application at <strong>app.stationforedu.com</strong>. By using Station, you agree to the practices described in this Policy.
            </p>
            <p>
              If you have questions about this Policy, contact us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="lp-sec">
            <h2>2. Information We Collect</h2>
            <p><strong>From Google Sign-In (OAuth):</strong></p>
            <ul>
              <li>Your name, as it appears in your Google account</li>
              <li>Your email address</li>
              <li>Your Google profile photo (if one exists)</li>
            </ul>
            <p style={{ marginTop: 14 }}><strong>Club and activity data:</strong></p>
            <ul>
              <li>Which clubs and organizations you join or follow</li>
              <li>Events you mark as attending</li>
              <li>Leadership roles you hold in clubs</li>
              <li>Notifications you send or receive in connection with club activities</li>
            </ul>
            <p style={{ marginTop: 14 }}><strong>Account preferences you set:</strong></p>
            <ul>
              <li>Notification settings (email notifications, event reminders, weekly digest)</li>
              <li>Privacy settings (profile visibility, membership visibility)</li>
              <li>Profile information you update in Settings (display name, profile photo)</li>
            </ul>
            <p style={{ marginTop: 14 }}><strong>Usage data collected automatically:</strong></p>
            <ul>
              <li>Pages and features you use within the Station application</li>
              <li>Actions you take (such as enrolling in a club or viewing an event)</li>
              <li>Your browser type and operating system</li>
              <li>Approximate location derived from your IP address</li>
              <li>Log data including access times and error reports</li>
            </ul>
            <p style={{ marginTop: 14 }}><strong>No third-party analytics:</strong> Station does not use any third-party analytics services such as Google Analytics, Mixpanel, Plausible, or similar tools. We reviewed the full codebase and confirmed no analytics scripts are present. Usage data is collected only by our own servers to operate and improve the service.</p>
          </div>

          {/* Section 3 */}
          <div className="lp-sec">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li><strong>Provide the Station service</strong> — displaying your clubs, calendar, events, and profile</li>
              <li><strong>Authenticate you</strong> via Google Sign-In and maintain your session</li>
              <li><strong>Send email notifications</strong> about club events and updates — only if you opt in to notifications in your Settings</li>
              <li><strong>Display your profile information</strong> (name, photo, clubs) to other Station users at your school, according to your privacy settings</li>
              <li><strong>Improve Station</strong> — understanding how features are used helps us make the product better</li>
              <li><strong>Communicate with you</strong> about service changes, security issues, or important updates</li>
            </ul>
            <p style={{ marginTop: 14 }}><strong>We do not sell your personal information</strong> to any third party for any purpose.</p>
            <p><strong>We do not use your information for advertising.</strong> No ads are shown on Station and your data is never used for targeted advertising.</p>
          </div>

          {/* Section 4 */}
          <div className="lp-sec">
            <h2>4. Information Sharing</h2>
            <p>We share your information only in the following limited circumstances:</p>
            <ul>
              <li>
                <strong>Google:</strong> We use Google OAuth for authentication. When you sign in with Google, you share information directly with Google. Google's use of that information is governed by <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.
              </li>
              <li>
                <strong>Supabase:</strong> Your data is stored in a database hosted by Supabase, Inc. Supabase processes data on our behalf as a service provider and is contractually prohibited from using your data for any other purpose. Supabase's privacy practices are described at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.
              </li>
              <li>
                <strong>School administrators:</strong> Club leaders and school administrators with admin access to Station can see club membership data, event attendance, and aggregate engagement data. They cannot see your private account settings.
              </li>
              <li>
                <strong>Legal requirements:</strong> We may disclose your information if required by law, court order, or government process, or if we believe disclosure is necessary to protect the safety of any person or to prevent fraud or illegal activity.
              </li>
            </ul>
            <p style={{ marginTop: 14 }}>We do not share your personal information with any other third parties.</p>
          </div>

          {/* Section 5 */}
          <div className="lp-sec">
            <h2>5. FERPA Notice</h2>
            <p>
              Station may be used in connection with educational institutions. To the extent that Station handles "education records" as defined by the Family Educational Rights and Privacy Act (FERPA), 20 U.S.C. § 1232g, we handle such records in accordance with FERPA requirements and only as directed by the educational institution.
            </p>
            <p>
              Students and parents who believe their FERPA rights may be implicated by Station, or who wish to review, correct, or request deletion of education records, may contact us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We will work with your institution to address any such requests.
            </p>
          </div>

          {/* Section 6 */}
          <div className="lp-sec">
            <h2>6. Children's Privacy (COPPA)</h2>
            <p>
              Station is intended for users who are at least <strong>13 years old</strong>. We do not knowingly collect personal information from children under 13. If you are under 13, please do not create an account or use Station.
            </p>
            <p>
              If we learn that we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information promptly.
            </p>
            <p>
              Parents or guardians who believe their child under 13 has provided us with personal information may contact us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will take immediate steps to delete that information.
            </p>
          </div>

          {/* Section 7 */}
          <div className="lp-sec">
            <h2>7. California Privacy Rights (CCPA/CPRA)</h2>
            <p>
              If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
            </p>
            <ul>
              <li><strong>Right to know</strong> — the categories and specific pieces of personal information we have collected about you, the purposes for which we use it, and the categories of third parties with whom we share it</li>
              <li><strong>Right to delete</strong> — request deletion of personal information we have collected from you, subject to certain exceptions</li>
              <li><strong>Right to correct</strong> — request correction of inaccurate personal information we hold about you</li>
              <li><strong>Right to opt out of sale or sharing</strong> — note that we do not sell or share your personal information for cross-context behavioral advertising</li>
              <li><strong>Right to non-discrimination</strong> — we will not discriminate against you for exercising any of these rights</li>
            </ul>
            <p style={{ marginTop: 14 }}>
              To exercise any of these rights, contact us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We will respond to verified requests within 45 days.
            </p>
          </div>

          {/* Section 8 */}
          <div className="lp-sec">
            <h2>8. Data Security</h2>
            <p>
              We use industry-standard measures to protect your information, including:
            </p>
            <ul>
              <li>Encrypted data transmission via HTTPS on all pages</li>
              <li>Secure authentication through Google OAuth (we never store your Google password)</li>
              <li>Access controls limiting which personnel can access user data</li>
              <li>Database-level security rules enforced through Supabase</li>
            </ul>
            <p style={{ marginTop: 14 }}>
              No system is completely secure. If you believe your Station account has been compromised, please contact us immediately at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          </div>

          {/* Section 9 */}
          <div className="lp-sec">
            <h2>9. Data Retention</h2>
            <p>
              We retain your account information for as long as your account remains active or as needed to provide you with the Station service.
            </p>
            <p>
              You may request deletion of your account and all associated personal data by emailing <a href={`mailto:${CONTACT}`}>{CONTACT}</a> with the subject line "Account Deletion Request." We will delete your data within <strong>30 days</strong> of verifying your identity and request, except where we are required to retain certain records by law.
            </p>
          </div>

          {/* Section 10 */}
          <div className="lp-sec">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by email (to the address associated with your Station account) or by displaying a notice in the Station app. The "Last updated" date at the top of this page reflects the most recent revision.
            </p>
            <p>
              Your continued use of Station after we post changes constitutes your acceptance of the updated Policy.
            </p>
          </div>

          {/* Section 11 */}
          <div className="lp-sec">
            <h2>11. Contact</h2>
            <p>Questions about this Privacy Policy? Contact:</p>
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
