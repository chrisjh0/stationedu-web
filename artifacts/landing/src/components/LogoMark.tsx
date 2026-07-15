interface LogoMarkProps {
  size?: number
  navyColor?: string
  dotColor?: string
  className?: string
}

export default function LogoMark({
  size = 30,
  navyColor = '#232E54',
  dotColor = '#DD5E54',
  className = '',
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="168 161.5 473 473"
      aria-hidden="true"
      className={className}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path
        fillRule="evenodd"
        fill={navyColor}
        d="M193,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z M354,461 a131,131 0 1,0 262,0 a131,131 0 1,0 -262,0 Z"
      />
      <circle fill={dotColor} cx="405" cy="263" r="58.5" />
    </svg>
  )
}
