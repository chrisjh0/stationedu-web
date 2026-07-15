import { useReveal } from '../hooks/useReveal'
import BrowserFrame from './BrowserFrame'

interface HeroProps {
  onDemoClick: () => void
}

export default function Hero({ onDemoClick }: HeroProps) {
  const leftRef = useReveal<HTMLDivElement>()
  const rightRef = useReveal<HTMLDivElement>(120)

  return (
    <section
      id="top"
      style={{ padding: '88px 0 96px', background: '#FCFCFB' }}
    >
      <div className="wrap">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 54,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left: copy */}
          <div ref={leftRef} className="reveal">
            <span className="kicker">Station for schools</span>
            <h1
              className="display-text"
              style={{ marginTop: 20, maxWidth: '14ch', textWrap: 'balance' } as React.CSSProperties}
            >
              One home for student life, and the proof your campus is thriving.
            </h1>
            <p
              className="lead"
              style={{ marginTop: 22, maxWidth: '46ch', textWrap: 'pretty' } as React.CSSProperties}
            >
              Station brings every club, event, meeting, and chat into one place
              students actually use, then turns that into live engagement data
              your school can stand behind.
            </p>
            <div style={{ marginTop: 30, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn-coral" onClick={onDemoClick}>
                <span className="ms" style={{ fontSize: 19 }}>calendar_month</span>
                Request a demo
              </button>
            </div>
          </div>

          {/* Right: browser frame + metric chip */}
          <div
            ref={rightRef}
            className="reveal d1"
            style={{ position: 'relative', alignSelf: 'center' }}
          >
            {/* Metric chip */}
            <div className="metric-chip" style={{ left: -24, top: -22 }}>
              <span className="ms" style={{ fontSize: 22, color: '#2F7D5B' }}>trending_up</span>
              <div>
                <div className="mc-num">+38%</div>
                <div className="mc-lbl">Student Participation</div>
              </div>
            </div>

            {/* Main browser frame */}
            <BrowserFrame url="app.stationedu.com/insights">
              <img
                src="/calendar-daily.jpeg"
                alt="Station calendar view"
                style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3332/2659' }}
                loading="eager"
              />
            </BrowserFrame>

            {/* Mini browser frame (secondary screenshot) */}
            <div
              className="browser-frame"
              style={{
                position: 'absolute',
                right: -26,
                bottom: -26,
                width: 220,
                zIndex: 2,
                opacity: 0.92,
              }}
            >
              <div className="browser-bar sm">
                <div className="browser-dot" />
                <div className="browser-dot" />
                <div className="browser-dot" />
              </div>
              <img
                src="/club-detail.jpeg"
                alt="Station club detail"
                style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '1758/1203' }}
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-grid .reveal.d1 > .browser-frame:last-child {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
