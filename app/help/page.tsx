"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getStoredUser } from "@/lib/language-storage"
import {
  ArrowLeft,
  Search,
  Phone,
  MessageCircle,
  Volume2,
  ChevronRight,
  HelpCircle,
  Shield,
  CreditCard,
  Send,
  Receipt,
  Users,
} from "lucide-react"

export default function HelpPage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push("/auth")
      return
    }
    setUser(storedUser)
  }, [router])

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Users,
      description: "Learn the basics of using SecureBank",
      articles: [
        {
          title: "How to check your balance",
          content: "Tap 'Check Balance' on the dashboard or go to Balance page to view your current account balance.",
        },
        {
          title: "Setting up your account",
          content: "Your account is already set up! You can change your PIN in Settings if needed.",
        },
        {
          title: "Understanding your dashboard",
          content: "The dashboard shows your balance, quick actions, and recent transactions all in one place.",
        },
      ],
    },
    {
      id: "sending-money",
      title: "Sending Money",
      icon: Send,
      description: "How to send money to others",
      articles: [
        {
          title: "How to send money",
          content:
            "1. Tap 'Send Money' 2. Enter phone number or select contact 3. Enter amount 4. Confirm details 5. Enter PIN",
        },
        {
          title: "Adding contacts",
          content: "When sending money, frequently used numbers are automatically saved to your contacts list.",
        },
        {
          title: "Transaction limits",
          content: "You can send up to $1,000 per day. Contact support for higher limits.",
        },
      ],
    },
    {
      id: "paying-bills",
      title: "Paying Bills",
      icon: Receipt,
      description: "How to pay your bills",
      articles: [
        {
          title: "How to pay bills",
          content: "1. Tap 'Pay Bills' 2. Select bill type 3. Enter account number 4. Enter amount 5. Confirm and pay",
        },
        {
          title: "Supported bill types",
          content: "You can pay electricity, water, gas bills, and mobile recharge through the app.",
        },
        { title: "Bill payment history", content: "View all your bill payments in the Transaction History section." },
      ],
    },
    {
      id: "security",
      title: "Security & Safety",
      icon: Shield,
      description: "Keep your account secure",
      articles: [
        {
          title: "Keeping your PIN safe",
          content: "Never share your PIN with anyone. Cover the screen when entering your PIN in public.",
        },
        {
          title: "What if I forget my PIN?",
          content: "Contact customer support at 1-800-SECURE or visit a branch to reset your PIN.",
        },
        {
          title: "Reporting suspicious activity",
          content: "If you notice unauthorized transactions, contact support immediately.",
        },
      ],
    },
    {
      id: "account",
      title: "Account Management",
      icon: CreditCard,
      description: "Managing your account",
      articles: [
        {
          title: "Viewing transaction history",
          content: "Tap 'Recent Transactions' on dashboard or go to Transaction History for detailed view.",
        },
        {
          title: "Downloading statements",
          content: "Go to Mini Statement and tap 'Download Full Statement' to get your account statement.",
        },
        {
          title: "Updating personal information",
          content: "Visit a branch or call customer support to update your personal details.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: HelpCircle,
      description: "Common issues and solutions",
      articles: [
        {
          title: "App is running slowly",
          content: "Close and reopen the app. If the problem persists, restart your phone.",
        },
        {
          title: "Transaction failed",
          content: "Check your internet connection and account balance. Try again or contact support.",
        },
        {
          title: "Can't log in",
          content: "Make sure you're entering the correct PIN. After 3 failed attempts, wait 15 minutes.",
        },
      ],
    },
  ]

  const allArticles = helpCategories.flatMap((category) =>
    category.articles.map((article) => ({ ...article, category: category.title, categoryId: category.id })),
  )

  const filteredArticles = searchTerm
    ? allArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const selectedCategoryData = helpCategories.find((cat) => cat.id === selectedCategory)

  const handleVoiceGuidance = (text: string) => {
    // Mock voice guidance
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    } else {
      alert("Voice guidance: " + text)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="h-12 w-12 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Help & Support</h1>
            <p className="text-primary-foreground/80">Get help with SecureBank</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchTerm && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Search Results</h2>
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try different keywords or browse categories below
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((article, index) => (
                  <Card key={index} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-foreground">{article.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVoiceGuidance(article.content)}
                          className="h-8 w-8 text-accent"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{article.category}</p>
                      <p className="text-sm text-foreground">{article.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category View */}
        {!searchTerm && selectedCategory && selectedCategoryData && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">{selectedCategoryData.title}</h2>
            </div>

            <div className="space-y-3">
              {selectedCategoryData.articles.map((article, index) => (
                <Card key={index} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground">{article.title}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleVoiceGuidance(article.content)}
                        className="h-8 w-8 text-accent"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground">{article.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {!searchTerm && !selectedCategory && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Help Categories</h2>
            <div className="space-y-3">
              {helpCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant="outline"
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full h-20 justify-between p-4 border-2 hover:bg-accent/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-base">{category.title}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Contact Support */}
        {!searchTerm && !selectedCategory && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact Support</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-16 justify-start gap-4 border-2 hover:bg-accent/10 bg-transparent"
                onClick={() => alert("Calling customer support: 1-800-SECURE")}
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Call Support</p>
                  <p className="text-sm text-muted-foreground">1-800-SECURE (24/7)</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full h-16 justify-start gap-4 border-2 hover:bg-accent/10 bg-transparent"
                onClick={() => alert("Opening chat support...")}
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Chat with our support team</p>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Voice Guidance Info */}
        {!searchTerm && !selectedCategory && (
          <Card className="border-2 border-accent/20 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-accent" />
                <div>
                  <p className="font-medium text-foreground">Voice Guidance Available</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the speaker icon next to any help article to hear it read aloud
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
