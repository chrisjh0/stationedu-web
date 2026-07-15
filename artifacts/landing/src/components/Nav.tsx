import { useState, useEffect } from 'react'
import LogoMark from './LogoMark'

interface NavProps {
  onDemoClick: () => void
}

const navLinks = [
  { href: '#features', label: 'Product' },
  { href: '#students', label: 'For students' },
  { href: '#schools', label: 'For schools' },
  { href: '#story', label: 'Our story' },
]

export default function Nav({ onDemoClick }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeLinkClick = () => setMenuOpen(false)

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: 'rgba(255,255,255,0.86)',
          backdropFilter: 'saturate(1.3) blur(10px)',
          WebkitBackdropFilter: 'saturate(1.3) blur(10px)',
          borderBottom: scrolled ? '1px solid #E1E5EE' : '1px solid transparent',
          transition: 'border-color 0.2s ease',
        }}
      >
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66, gap: 18 }}>
          {/* Brand */}
          <a
            href="#top"
            style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <LogoMark size={30} />
            <span
              style={{
                fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: '-0.02em',
                color: '#121726',
              }}
            >
              Station
            </span>
          </a>

          {/* Desktop nav links */}
          <nav
            style={{ display: 'flex', gap: 24 }}
            className="hidden-mobile"
          >
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  fontSize: 14,
                  color: '#4C5567',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#121726')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4C5567')}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a
              href="https://app.stationforedu.com"
              className="btn-outline hidden-mobile"
              style={{ fontSize: 14, padding: '9px 16px' }}
            >
              <span className="ms" style={{ fontSize: 17 }}>login</span>
              Log in
            </a>
            <button className="btn-coral" onClick={onDemoClick} style={{ fontSize: 14, padding: '9px 16px' }}>
              <span className="ms" style={{ fontSize: 17 }}>calendar_month</span>
              Request a demo
            </button>
            {/* Hamburger */}
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                flexDirection: 'column',
                gap: 5,
              }}
              className="show-mobile"
            >
              <span
                className="hamburger-line"
                style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}}
              />
              <span
                className="hamburger-line"
                style={menuOpen ? { opacity: 0 } : {}}
              />
              <span
                className="hamburger-line"
                style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: 66,
            zIndex: 55,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 24px',
            gap: 8,
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={closeLinkClick}
              style={{
                fontSize: 22,
                fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                fontWeight: 700,
                color: '#121726',
                textDecoration: 'none',
                padding: '12px 0',
                borderBottom: '1px solid #E1E5EE',
                letterSpacing: '-0.02em',
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href="https://app.stationforedu.com"
              className="btn-outline"
              style={{ justifyContent: 'center' }}
              onClick={closeLinkClick}
            >
              <span className="ms" style={{ fontSize: 17 }}>login</span>
              Log in
            </a>
            <button
              className="btn-coral"
              onClick={() => { closeLinkClick(); onDemoClick() }}
              style={{ justifyContent: 'center' }}
            >
              <span className="ms" style={{ fontSize: 17 }}>calendar_month</span>
              Request a demo
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .hidden-mobile { display: none !important; }
        }
        @media (max-width: 960px) {
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 961px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}
