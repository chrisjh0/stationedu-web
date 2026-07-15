import { useReveal } from '../hooks/useReveal'

export default function FounderQuote() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section
      id="story"
      style={{ padding: '108px 0', background: '#F7F7F5', borderTop: '1px solid #ECEAE4', borderBottom: '1px solid #ECEAE4' }}
    >
      <div className="wrap">
        <div ref={ref} className="reveal" style={{ maxWidth: 760 }}>
          <p
            style={{
              fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(20px, 2.1vw, 27px)',
              lineHeight: 1.4,
              color: '#121726',
              letterSpacing: '-0.01em',
            }}
          >
            Discovering what we love to do: that is what school is all about. I found it hard to
            fully engage in student life and student-led clubs at my school; I built Station to
            help ensure every student has the opportunity to{' '}
            <span className="hl">discover and pursue their passions</span>.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 30 }}>
            {/* Founder photo placeholder */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#E7EAF3',
                border: '1px solid #CAD1DF',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#4C5567',
                  letterSpacing: '-0.02em',
                }}
              >
                CH
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: '#121726',
                }}
              >
                Christopher Ho
              </div>
              <div style={{ fontSize: 13, color: '#79839A' }}>Founder</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
