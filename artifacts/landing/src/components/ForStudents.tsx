import { useReveal } from '../hooks/useReveal'
import BrowserFrame from './BrowserFrame'

const ITEMS = [
  {
    icon: 'explore',
    title: 'See everything on campus',
    body: 'One directory of every group, searchable, not taped to a hallway wall.',
  },
  {
    icon: 'add_circle',
    title: 'Join in a single tap',
    body: 'RSVP, get the chat, and land on the calendar: no forms, no fuss.',
  },
  {
    icon: 'group',
    title: 'Belong somewhere',
    body: 'A place for every student to find the people they click with.',
  },
]

export default function ForStudents() {
  const leftRef = useReveal<HTMLDivElement>()
  const rightRef = useReveal<HTMLDivElement>(120)

  return (
    <section
      id="students"
      style={{ padding: '108px 0', background: '#FCFCFB', borderTop: '1px solid #ECEAE4' }}
    >
      <div className="wrap">
        <div className="split-grid">
          {/* Left: copy */}
          <div ref={leftRef} className="reveal">
            <span className="kicker">For students</span>
            <h2
              className="section-h2"
              style={{ margin: '16px 0 0', maxWidth: '14ch', textWrap: 'balance' } as React.CSSProperties}
            >
              Find your people, in a tap.
            </h2>
            <p
              className="lead"
              style={{ marginTop: 16, maxWidth: '42ch', textWrap: 'pretty' } as React.CSSProperties}
            >
              From robotics to rugby to ranchera band, every club, team, and
              society lives in one place. Discover them, join in a tap, and
              never miss a meeting again.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28 }}>
              {ITEMS.map((item) => (
                <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span
                    className="ms"
                    style={{ fontSize: 22, color: '#DD5E54', flexShrink: 0, marginTop: 2 }}
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
                        color: '#121726',
                        marginBottom: 3,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.title}
                    </b>
                    <p style={{ fontSize: 14, lineHeight: 1.5, color: '#4C5567' }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: browser frame */}
          <div ref={rightRef} className="reveal d1" style={{ alignSelf: 'center' }}>
            <BrowserFrame url="app.stationedu.com/clubs">
              <img
                src="/directory.jpeg"
                alt="Station club directory"
                style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3339/2626' }}
                loading="lazy"
              />
            </BrowserFrame>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .split-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}
