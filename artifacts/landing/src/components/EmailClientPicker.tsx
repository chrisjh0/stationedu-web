import { useEffect, useRef } from 'react'

interface EmailClientPickerProps {
  open: boolean
  onClose: () => void
}

const TO = '31christopherho@gmail.com'
const SUBJECT = 'Demo Request — Station'

export default function EmailClientPicker({ open, onClose }: EmailClientPickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const handleMailApp = () => {
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(SUBJECT)}`
    onClose()
  }

  const handleGmail = () => {
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(TO)}&su=${encodeURIComponent(SUBJECT)}`,
      '_blank',
      'noopener,noreferrer',
    )
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Choose email client"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(18, 23, 38, 0.48)',
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
          maxWidth: 380,
          padding: '32px 28px 28px',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
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

        <p
          style={{
            fontFamily: '"Schibsted Grotesk", system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '-0.02em',
            color: '#121726',
            marginBottom: 6,
          }}
        >
          How would you like to send?
        </p>
        <p style={{ fontSize: 13.5, color: '#79839A', marginBottom: 22 }}>
          Choose your email client to draft a demo request.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-coral" onClick={handleGmail} style={{ justifyContent: 'center' }}>
            <span className="ms" style={{ fontSize: 18 }}>mail</span>
            Open Gmail
          </button>
          <button className="btn-outline" onClick={handleMailApp} style={{ justifyContent: 'center' }}>
            <span className="ms" style={{ fontSize: 18 }}>open_in_new</span>
            Open Mail App
          </button>
        </div>
      </div>
    </div>
  )
}
