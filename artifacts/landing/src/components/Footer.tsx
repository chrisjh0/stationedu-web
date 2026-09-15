import LogoMark from './LogoMark'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#F7F7F5',
        borderTop: '1px solid #ECEAE4',
        padding: '34px 0 26px',
      }}
    >
      <div className="wrap">
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
          <a
            href="#top"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              textDecoration: 'none',
              flexShrink: 0,
            }}
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            <LogoMark size={28} />
            <span
              style={{
                fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: '-0.02em',
                color: '#121726',
              }}
            >
              Station
            </span>
          </a>
          <p
            style={{
              flex: 1,
              minWidth: 240,
              fontSize: 14.5,
              lineHeight: 1.6,
              color: '#4C5567',
              margin: 0,
            }}
          >
            One place for every club, team, and society, and the engagement data schools have never had.
          </p>
        </div>

        <div
          style={{
            borderTop: '1px solid #ECEAE4',
            marginTop: 22,
            paddingTop: 18,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 11.5,
            color: '#4C5567',
          }}
        >
          <span>© 2026 Station Education, Inc.</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <a href="/privacy" style={{ color: '#4C5567', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C04A40')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4C5567')}
            >Privacy</a>
            <a href="/terms" style={{ color: '#4C5567', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C04A40')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4C5567')}
            >Terms</a>
            <a href="/cookies" style={{ color: '#4C5567', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C04A40')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4C5567')}
            >Cookies</a>
            <a href="/accessibility" style={{ color: '#4C5567', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#C04A40')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4C5567')}
            >Accessibility</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
