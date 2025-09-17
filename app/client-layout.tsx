"use client"

import type React from "react"

import { Analytics } from "@vercel/analytics/next"
// <CHANGE> Added ThemeProvider for dark/light mode toggle
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* <CHANGE> Wrapped children in ThemeProvider for theme switching */}
      {/* <CHANGE> Wrapped ThemeProvider in Suspense boundary for useSearchParams() */}
      <Suspense fallback={null}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </Suspense>
      <Analytics />
    </>
  )
}
