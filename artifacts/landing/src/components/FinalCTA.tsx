import { useReveal } from '../hooks/useReveal'

interface FinalCTAProps {
  onDemoClick: () => void
}

export default function FinalCTA({ onDemoClick }: FinalCTAProps) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section style={{ padding: '108px 0', background: '#232E54' }}>
      <div className="wrap">
        <div
          ref={ref}
          className="reveal"
          style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto' }}
        >
          <span className="kicker-on-ink">Bring Station to your school</span>
          <h2
            style={{
              fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(32px, 4.4vw, 54px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.04,
              color: '#ffffff',
              maxWidth: '20ch',
              margin: '16px auto 0',
              textWrap: 'balance',
            } as React.CSSProperties}
          >
            Give every student a place to belong, and every school the proof.
          </h2>
          <p
            className="lead"
            style={{ color: 'rgba(255,255,255,0.8)', margin: '18px auto 0', maxWidth: '52ch' }}
          >
            Book a 20-minute walkthrough. We&rsquo;ll show you the student experience
            and the dashboard your board will love.
          </p>
          <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
            <button className="btn-white-on-navy" onClick={onDemoClick}>
              <span className="ms" style={{ fontSize: 19 }}>calendar_month</span>
              Request a demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
