import { cn } from '@lib/utils'

interface PingPongAnimationProps {
  className?: string
}

export function PingPongAnimation({ className }: PingPongAnimationProps) {
  return (
    <div className={cn('relative w-32 h-32', className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Raquette */}
        <g className="origin-center">
          {/* Manche de la raquette */}
          <rect
            x="42"
            y="60"
            width="16"
            height="28"
            rx="3"
            fill="#8B4513"
            stroke="#5D3A1A"
            strokeWidth="1"
          />
          {/* Partie rouge de la raquette */}
          <ellipse
            cx="50"
            cy="40"
            rx="28"
            ry="32"
            fill="#B80000"
            stroke="#8B0000"
            strokeWidth="2"
          />
          {/* Reflet sur la raquette */}
          <ellipse cx="42" cy="32" rx="8" ry="10" fill="#D32F2F" opacity="0.5" />
        </g>

        {/* Balle avec animation de jonglage */}
        <g className="animate-ping-pong-ball">
          <circle cx="75" cy="20" r="10" fill="#FF6600" stroke="#CC5200" strokeWidth="1" />
          {/* Reflet sur la balle */}
          <circle cx="72" cy="17" r="3" fill="#FFB366" opacity="0.7" />
        </g>
      </svg>
    </div>
  )
}
