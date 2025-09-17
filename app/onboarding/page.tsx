"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { languages, setStoredLanguage, type Language } from "@/lib/language-storage"
import { Globe, ArrowRight, Shield, Smartphone, Users } from "lucide-react"

export default function OnboardingPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en")
  const router = useRouter()

  const handleLanguageSelect = (languageCode: Language) => {
    setSelectedLanguage(languageCode)
  }

  const handleContinue = () => {
    setStoredLanguage(selectedLanguage)
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">SecureBank</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="px-4 pb-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SecureBank</h1>
            <p className="text-lg text-muted-foreground text-balance">Simple, secure banking designed for everyone</p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <Card className="border-2 border-primary/20">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Bank Safe & Secure</h3>
                  <p className="text-sm text-muted-foreground">Your money is protected with advanced security</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">Simple steps for all your banking needs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">24/7 Support</h3>
                  <p className="text-sm text-muted-foreground">Help is always available when you need it</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Language Selection */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-2">
              <Globe className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-xl">Choose Your Language</CardTitle>
            <CardDescription className="text-base">Select your preferred language to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant={selectedLanguage === language.code ? "default" : "outline"}
                className={`w-full h-16 text-left justify-start gap-4 ${
                  selectedLanguage === language.code
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-accent/10 border-2"
                }`}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span className="text-2xl">{language.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-base">{language.name}</span>
                  <span className="text-sm opacity-80">{language.nativeName}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  )
}
