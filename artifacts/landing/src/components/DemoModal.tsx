import { useState, useEffect, useRef } from 'react'

interface DemoModalProps {
  open: boolean
  onClose: () => void
}

interface FormState {
  name: string
  school: string
  email: string
  message: string
}

export default function DemoModal({ open, onClose }: DemoModalProps) {
  const [form, setForm] = useState<FormState>({ name: '', school: '', email: '', message: '' })
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => firstInputRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent('Demo Request — Station')
    const body = encodeURIComponent(
      `Name: ${form.name}\nSchool: ${form.school}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    )
    window.location.href = `mailto:support@stationforedu.com?subject=${subject}&body=${body}`
    onClose()
    setForm({ name: '', school: '', email: '', message: '' })
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(18, 23, 38, 0.56)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          boxShadow: '0 10px 26px rgba(18,23,38,.18), 0 40px 80px rgba(18,23,38,.22)',
          width: '100%',
          maxWidth: 520,
          padding: '36px 36px 32px',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#79839A',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#121726')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#79839A')}
        >
          <span className="ms" style={{ fontSize: 22 }}>close</span>
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <span className="kicker" style={{ marginBottom: 10, display: 'block' }}>Request a demo</span>
          <h2
            id="demo-modal-title"
            style={{
              fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '-0.02em',
              color: '#121726',
              margin: '8px 0 6px',
            }}
          >
            Book a 20-minute walkthrough
          </h2>
          <p style={{ fontSize: 14.5, color: '#4C5567', lineHeight: 1.55 }}>
            We'll show you the student experience and the dashboard your board will love.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle} htmlFor="demo-name">Your name</label>
              <input
                ref={firstInputRef}
                id="demo-name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                required
                placeholder="Jane Smith"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: '#CAD1DF', boxShadow: 'none' })}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="demo-school">School name</label>
              <input
                id="demo-school"
                type="text"
                value={form.school}
                onChange={handleChange('school')}
                required
                placeholder="Lincoln High School"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: '#CAD1DF', boxShadow: 'none' })}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle} htmlFor="demo-email">Email address</label>
            <input
              id="demo-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              placeholder="jane@lincoln.edu"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: '#CAD1DF', boxShadow: 'none' })}
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="demo-message">Message <span style={{ color: '#79839A', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              id="demo-message"
              value={form.message}
              onChange={handleChange('message')}
              placeholder="Tell us a bit about your school and what you're hoping to get from Station…"
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: '#CAD1DF', boxShadow: 'none' })}
            />
          </div>

          <button type="submit" className="btn-coral" style={{ justifyContent: 'center', marginTop: 4 }}>
            <span className="ms" style={{ fontSize: 19 }}>send</span>
            Send request
          </button>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: '#79839A', marginTop: 2 }}>
            Opens your email client — no data is collected on this site.
          </p>
        </form>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#4C5567',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
  fontSize: 14,
  padding: '10px 13px',
  borderRadius: 8,
  background: '#ffffff',
  color: '#181D29',
  border: '1px solid #CAD1DF',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxSizing: 'border-box',
}

const inputFocusStyle: React.CSSProperties = {
  borderColor: '#DD5E54',
  boxShadow: '0 0 0 3px rgba(221, 94, 84, 0.22)',
}
