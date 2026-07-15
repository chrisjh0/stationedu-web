import { useReveal } from '../hooks/useReveal'
import BrowserFrame from './BrowserFrame'

const ITEMS = [
  {
    icon: 'insights',
    title: 'Live engagement analytics',
    body: 'Participation by grade, club, and category: no manual surveys.',
  },
  {
    icon: 'description',
    title: 'Board- & admissions-ready reports',
    body: 'Export a clean summary of campus life in one click.',
  },
  {
    icon: 'school',
    title: 'A story for prospective families',
    body: "Show a campus that's measurably alive.",
  },
]

const ICON_COLOR = 'color-mix(in oklab, #DD5E54 62%, #ffffff)'

export default function ForSchools() {
  const leftRef = useReveal<HTMLDivElement>()
  const rightRef = useReveal<HTMLDivElement>(120)

  return (
    <section
      id="schools"
      style={{ padding: '108px 0', background: '#232E54' }}
    >
      <div className="wrap">
        <div className="split-grid">
          {/* Left: copy */}
          <div ref={leftRef} className="reveal">
            <span className="kicker-on-ink">For schools &amp; administrators</span>
            <h2
              className="section-h2"
              style={{ margin: '16px 0 0', color: '#ffffff', maxWidth: '15ch', textWrap: 'balance' } as React.CSSProperties}
            >
              When students love it, schools win.
            </h2>
            <p
              className="lead"
              style={{ marginTop: 16, maxWidth: '42ch', color: 'rgba(255,255,255,0.76)', textWrap: 'pretty' } as React.CSSProperties}
            >
              Because students use Station, administration finally gets an
              accurate, real-time picture of engagement, and the report to prove it.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
              {ITEMS.map((item) => (
                <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span
                    className="ms"
                    style={{ fontSize: 22, color: ICON_COLOR, flexShrink: 0, marginTop: 2 }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <b
                      style={{
                        display: 'block',
                        fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: 16.5,
                        color: '#ffffff',
                        marginBottom: 3,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.title}
                    </b>
                    <p style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(255,255,255,0.72)' }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: browser frame */}
          <div ref={rightRef} className="reveal d1" style={{ alignSelf: 'center' }}>
            <BrowserFrame url="app.stationedu.com/insights">
              <img
                src="/admin-analytics.jpeg"
                alt="Station admin analytics dashboard"
                style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3329/3879' }}
                loading="lazy"
              />
            </BrowserFrame>
          </div>
        </div>
      </div>
    </section>
  )
}
