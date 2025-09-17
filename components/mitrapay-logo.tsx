interface MitraPayLogoProps {
  size?: number
  className?: string
}

export function MitraPayLogo({ size = 48, className = "" }: MitraPayLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Circular background with gradient */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="url(#gradient)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Rupee symbol in center */}
        <path
          d="M16 18h12M16 22h8l4 8M16 26h6"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Abstract hands/arcs representing friendship and support */}
        <path d="M8 20c2-4 6-6 10-4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
        <path d="M40 28c-2 4-6 6-10 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      </svg>

      <div className="flex flex-col">
        <span className="text-xl font-bold text-foreground">MitraPay</span>
        <span className="text-xs text-muted-foreground">Trusted Banking</span>
      </div>
    </div>
  )
}
