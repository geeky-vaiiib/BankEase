"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff } from "lucide-react"

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // Hide the "back online" message after 3 seconds
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showStatus && isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2">
      <Alert className={`mx-auto max-w-md ${
        isOnline 
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
          : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertDescription className={`text-sm font-medium ${
            isOnline 
              ? "text-green-800 dark:text-green-200" 
              : "text-red-800 dark:text-red-200"
          }`}>
            {isOnline ? "Back online" : "You are offline. Some features may not work."}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  )
}
