import { useEffect } from 'react'
import LogoMark from '../components/LogoMark'

export default function Privacy() {
  useEffect(() => { document.title = 'Privacy Policy — Station'; }, [])
  return (
    <>
      <style>{`
        .a11y-wrap { max-width: 760px; margin: 0 auto; padding: 0 44px; }
        @media (max-width: 820px) { .a11y-wrap { padding: 0 24px; } }
        @media (max-width: 480px) { .a11y-wrap { padding: 0 16px; } }
      `}</style>

      <header style={{ borderBottom: '1px solid #E1E5EE', background: '#FCFCFB' }}>
        <div className="a11y-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }} aria-label="Station — back to home">
            <LogoMark size={28} />
            <span style={{ fontFamily: '"Schibsted Grotesk", system-ui, sans-serif', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', color: '#121726' }}>
              Station
            </span>
          </a>
          <a href="/" style={{ fontSize: 13.5, color: '#4C5567', textDecoration: 'none', fontWeight: 500 }}>← Back to home</a>
        </div>
      </header>

      <main style={{ padding: '60px 0 96px', background: '#FCFCFB' }}>
        <div className="a11y-wrap">
          <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C6478', display: 'inline-block', marginBottom: 14 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: '"Schibsted Grotesk", system-ui, sans-serif', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: '#121726', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 24px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: '#4C5567', lineHeight: 1.7, maxWidth: '56ch' }}>
            Our full Privacy Policy is coming soon. If you have questions about how Station handles your data, please
            contact us at{' '}
            <a href="mailto:27cho@athenian.org" style={{ color: '#C04A40', textDecoration: 'underline' }}>
              27cho@athenian.org
            </a>.
          </p>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #ECEAE4', background: '#F7F7F5', padding: '24px 0' }}>
        <div className="a11y-wrap">
          <p style={{ fontSize: 13, color: '#4C5567', margin: 0 }}>
            © 2026 Station Education, Inc. ·{' '}
            <a href="/accessibility" style={{ color: '#4C5567' }}>Accessibility</a> ·{' '}
            <a href="/terms" style={{ color: '#4C5567' }}>Terms</a>
          </p>
        </div>
      </footer>
    </>
  )
}
