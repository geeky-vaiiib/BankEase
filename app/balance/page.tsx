"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoredUser } from "@/lib/language-storage"
import { api, ApiError } from "@/lib/api"
import { ArrowLeft, Eye, EyeOff, Download, RefreshCw } from "lucide-react"

export default function BalancePage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [showBalance, setShowBalance] = useState(true)
  const [balance, setBalance] = useState<number>(0)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        if (!api.isAuthenticated()) {
          router.push("/auth")
          return
        }

        // Verify token and get user info
        const userResponse = await api.verifyToken()
        if (!userResponse.success) {
          router.push("/auth")
          return
        }

        setUser({ name: userResponse.data.user.name, pin: "****" })

        // Fetch balance
        const balanceResponse = await api.getBalance()
        if (balanceResponse.success) {
          setBalance(balanceResponse.data.balance)
        }

        // Fetch recent transactions
        const transactionsResponse = await api.getRecentTransactions()
        if (transactionsResponse.success) {
          setRecentTransactions(transactionsResponse.data.transactions)
        }

      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message)
          if (error.status === 401) {
            router.push("/auth")
            return
          }
        } else {
          setError("Failed to load data. Please try again.")
        }
        console.error("Balance page error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError("")
    
    try {
      // Fetch fresh balance
      const balanceResponse = await api.getBalance()
      if (balanceResponse.success) {
        setBalance(balanceResponse.data.balance)
      }

      // Fetch fresh recent transactions
      const transactionsResponse = await api.getRecentTransactions()
      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.data.transactions)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError("Failed to refresh data. Please try again.")
      }
      console.error("Refresh error:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
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
            <h1 className="text-xl font-bold">Account Balance</h1>
            <p className="text-primary-foreground/80">Current balance and recent activity</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Available Balance</CardTitle>
            <CardDescription>Last updated: Just now</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl font-bold text-primary">{showBalance ? `$${balance.toFixed(2)}` : "••••••"}</div>
              <Button variant="ghost" size="icon" onClick={() => setShowBalance(!showBalance)} className="h-10 w-10">
                {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex-1 max-w-40 bg-transparent"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Updating..." : "Refresh"}
              </Button>

              <Button onClick={() => router.push("/statement")} variant="outline" className="flex-1 max-w-40">
                <Download className="h-4 w-4 mr-2" />
                Statement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mini Statement */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Last 5 Transactions</h2>
            <Button
              variant="ghost"
              onClick={() => router.push("/transactions")}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <Card key={transaction.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            transaction.type === "receive"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "receive" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{transaction.type}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border border-border">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No recent transactions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => router.push("/send-money")}
            className="h-14 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Send Money
          </Button>
          <Button onClick={() => router.push("/pay-bills")} variant="outline" className="h-14 border-2">
            Pay Bills
          </Button>
        </div>
      </div>
    </div>
  )
}
