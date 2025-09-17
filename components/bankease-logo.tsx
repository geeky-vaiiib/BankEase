"use client"

import { cn } from "@/lib/utils"

interface BankEaseLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function BankEaseLogo({ className, size = "md" }: BankEaseLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Custom BankEase Logo with Rupee Symbol and Shield */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl gradient-teal-amber shadow-banking",
          sizeClasses[size],
        )}
      >
        {/* Shield/Arc Background */}
        <svg viewBox="0 0 48 48" className="w-full h-full absolute inset-0" fill="none">
          <path
            d="M24 4L36 12V24C36 32 24 44 24 44C24 44 12 32 12 24V12L24 4Z"
            fill="url(#shield-gradient)"
            fillOpacity="0.1"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <defs>
            <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Rupee Symbol */}
        <div className="relative z-10 text-white font-bold text-lg">₹</div>

        {/* Ease Wave */}
        <svg viewBox="0 0 24 24" className="absolute bottom-1 right-1 w-3 h-3 text-white/60" fill="currentColor">
          <path
            d="M2 12C2 12 4 8 8 8C12 8 14 12 18 12C22 12 24 8 24 8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* BankEase Text */}
      <div className="flex flex-col">
        <span className="font-bold text-lg text-foreground leading-none">BankEase</span>
        <span className="text-xs text-muted-foreground leading-none">Banking Made Simple</span>
      </div>
    </div>
  )
}
