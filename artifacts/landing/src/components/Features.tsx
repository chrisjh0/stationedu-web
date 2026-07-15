import { useReveal } from '../hooks/useReveal'

const CARDS = [
  {
    icon: 'calendar_month',
    title: 'One shared calendar',
    body: 'Every meeting, game, and rehearsal in a single schedule, with the times and rooms students can actually find.',
  },
  {
    icon: 'explore',
    title: 'Discover every club',
    body: 'A browsable directory of every club and team, sorted by category, so any student can find their people in an afternoon.',
  },
  {
    icon: 'notifications_active',
    title: 'Reminders that have your back',
    body: "A nudge before every meeting and deadline, so the thing you signed up for doesn't quietly slip away.",
  },
]

const BEFORE = [
  'Engagement guessed from hallway buzz and a yearly survey',
  'Club info scattered across group chats, flyers, and sign-up sheets',
  'Advisors chase rosters and attendance by hand',
  'Nothing concrete to show a board or a prospective family',
]

const AFTER = [
  'Live participation data, accurate to the day',
  'One shared home for every club, event, and chat',
  'Rosters and attendance logged automatically',
  'A board- and admissions-ready report, one click away',
]

const ICON_COLOR = 'color-mix(in oklab, #DD5E54 62%, #ffffff)'

export default function Features() {
  const headerRef = useReveal<HTMLDivElement>()
  const cardsRef = useReveal<HTMLDivElement>(80)
  const cmpRef = useReveal<HTMLDivElement>(160)

  return (
    <section
      id="features"
      style={{ padding: '108px 0', background: '#232E54' }}
    >
      <div className="wrap">
        {/* Header */}
        <div ref={headerRef} className="reveal">
          <span className="kicker-on-ink">Everything in one place</span>
          <h2
            className="section-h2"
            style={{ margin: '16px 0 6px', color: '#ffffff', maxWidth: '20ch', textWrap: 'balance' } as React.CSSProperties}
          >
            The product students actually open.
          </h2>
          <p
            className="lead"
            style={{ maxWidth: '56ch', marginBottom: 48, color: 'rgba(255,255,255,0.76)' }}
          >
            No more group-text chaos or flyers taped to a wall. Because students use it, the data underneath it is real.
          </p>
        </div>

        {/* Feature cards — editorial style (top border, no bg) */}
        <div
          ref={cardsRef}
          className="reveal d1 features-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32,
          }}
        >
          {CARDS.map((c) => (
            <div key={c.title} className="fcard-editorial">
              <span
                className="ms"
                style={{ fontSize: 28, color: ICON_COLOR }}
              >
                {c.icon}
              </span>
              <h3
                style={{
                  fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  margin: '18px 0 8px',
                }}
              >
                {c.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14.5, lineHeight: 1.6 }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 820px) {
            .features-cards { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Before / After comparison */}
        <div ref={cmpRef} className="reveal" style={{ marginTop: 56 }}>
          <div className="cmp-grid">
            {/* Before */}
            <div style={{ padding: 34, background: '#EEF1F5', borderRight: '1px solid #CAD1DF' }}>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#79839A',
                  display: 'inline-block',
                  marginBottom: 18,
                }}
              >
                Before Station
              </span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 15 }}>
                {BEFORE.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: '#4C5567', fontSize: 15.5, lineHeight: 1.45 }}>
                    <span className="ms" style={{ fontSize: 20, color: '#79839A', flexShrink: 0, marginTop: 1 }}>close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div style={{ padding: 34, background: '#ffffff' }}>
              <span
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#DD5E54',
                  display: 'inline-block',
                  marginBottom: 18,
                }}
              >
                With Station
              </span>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 15 }}>
                {AFTER.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: '#121726', fontSize: 15.5, lineHeight: 1.45 }}>
                    <span className="ms" style={{ fontSize: 20, color: '#2F7D5B', flexShrink: 0, marginTop: 1 }}>check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .cmp-grid {
            grid-template-columns: 1fr !important;
          }
          .cmp-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid #CAD1DF;
          }
        }
      `}</style>
    </section>
  )
}
