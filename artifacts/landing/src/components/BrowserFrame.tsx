interface BrowserFrameProps {
  url?: string
  children: React.ReactNode
  small?: boolean
  className?: string
}

export default function BrowserFrame({ url, children, small = false, className = '' }: BrowserFrameProps) {
  return (
    <div className={`browser-frame ${className}`}>
      <div className={`browser-bar${small ? ' sm' : ''}`}>
        <div className="browser-dot" />
        <div className="browser-dot" />
        <div className="browser-dot" />
        {url && <div className="browser-url">{url}</div>}
      </div>
      {children}
    </div>
  )
}
