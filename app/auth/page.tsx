"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { getStoredUser, setStoredUser, getStoredLanguage } from "@/lib/language-storage"
import { api, ApiError } from "@/lib/api"
import { Shield, Fingerprint, Eye, EyeOff, ArrowLeft, User, Lock } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const language = getStoredLanguage()
    if (!language) {
      router.push("/onboarding")
      return
    }

    // Check if user is already authenticated with backend
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          await api.verifyToken()
          router.push("/dashboard")
        } catch (error) {
          // Token is invalid, continue with login
          console.log("Token verification failed:", error)
        }
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Check if user is online
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError("You are offline. Please check your internet connection.")
        setIsLoading(false)
        return
      }

      if (isLogin) {
        // Login with backend API
        if (!phone || !pin) {
          setError("Please enter both phone number and PIN")
          setIsLoading(false)
          return
        }

        if (pin.length !== 4) {
          setError("PIN must be exactly 4 digits")
          setIsLoading(false)
          return
        }

        const response = await api.login({ phone: phone.trim(), pin })
        
        if (response.success) {
          // Store user data locally for backward compatibility
          setStoredUser({ 
            name: response.data.user.name, 
            pin: "****" // Don't store actual PIN
          })
          router.push("/dashboard")
        }
      } else {
        // Registration with backend API
        if (pin !== confirmPin) {
          setError("PINs do not match. Please try again.")
          setIsLoading(false)
          return
        }
        if (pin.length !== 4) {
          setError("PIN must be exactly 4 digits.")
          setIsLoading(false)
          return
        }
        if (name.trim().length < 2) {
          setError("Please enter your full name (at least 2 characters).")
          setIsLoading(false)
          return
        }
        if (!phone.trim()) {
          setError("Please enter your phone number.")
          setIsLoading(false)
          return
        }

        const response = await api.register({ 
          name: name.trim(), 
          phone: phone.trim(), 
          pin 
        })

        if (response.success) {
          // Store user data locally for backward compatibility
          setStoredUser({ 
            name: response.data.user.name, 
            pin: "****" // Don't store actual PIN
          })
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      
      if (error instanceof ApiError) {
        switch (error.type) {
          case 'offline':
            setError("You are offline. Please check your internet connection.")
            break
          case 'network':
            setError("Network error. Please check your connection and try again.")
            break
          case 'timeout':
            setError("Request timed out. Please try again.")
            break
          case 'auth':
            if (error.status === 401) {
              setError("Invalid phone number or PIN. Please try again.")
            } else {
              setError("Authentication failed. Please try again.")
            }
            break
          case 'server':
            if (error.status === 409) {
              setError("This phone number is already registered. Please try logging in instead.")
            } else if (error.status >= 500) {
              setError("Server error. Please try again later.")
            } else {
              setError(error.message || "An error occurred. Please try again.")
            }
            break
          default:
            setError(error.message || "An unexpected error occurred. Please try again.")
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometric = () => {
    // Mock biometric authentication
    alert("Biometric authentication would be implemented here with device APIs")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/onboarding")} className="h-12 w-12">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">SecureBank</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="px-4 pb-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Enter your PIN to access your account" : "Set up your secure banking account"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription className="text-center">
              {isLogin ? "Enter your 4-digit PIN" : "Choose a secure 4-digit PIN"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-base font-medium">
                  {isLogin ? "PIN" : "Create PIN"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                      setPin(value)
                    }}
                    className="pl-10 pr-10 h-12 text-base text-center tracking-widest"
                    maxLength={4}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPin" className="text-base font-medium">
                    Confirm PIN
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPin"
                      type={showPin ? "text" : "password"}
                      placeholder="Confirm 4-digit PIN"
                      value={confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                        setConfirmPin(value)
                      }}
                      className="pl-10 h-12 text-base text-center tracking-widest"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                disabled={
                  isLoading ||
                  (isLogin 
                    ? phone.length === 0 || pin.length !== 4 
                    : pin.length !== 4 || confirmPin.length !== 4 || !name.trim() || !phone.trim())
                }
              >
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Biometric Option */}
        {isLogin && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Button
                onClick={handleBiometric}
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 border-accent/20 hover:bg-accent/10 bg-transparent"
              >
                <Fingerprint className="mr-2 h-5 w-5" />
                Use Fingerprint
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Toggle Auth Mode */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
              setPin("")
              setConfirmPin("")
              setName("")
              setPhone("")
            }}
            className="text-primary hover:text-primary/80"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
