"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getStoredLanguage, getStoredUser } from "@/lib/language-storage"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const language = getStoredLanguage()
    const user = getStoredUser()

    // If no language selected, go to onboarding
    if (!language || language === "en") {
      router.push("/onboarding")
      return
    }

    // If language selected but no user, go to auth
    if (!user) {
      router.push("/auth")
      return
    }

    // If both language and user exist, go to dashboard
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading SecureBank...</p>
      </div>
    </div>
  )
}
