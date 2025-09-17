"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { BankEaseLogo } from "@/components/bankease-logo"
import { PinInputDialog } from "@/components/pin-input-dialog"
import { getStoredUser, clearStoredUser } from "@/lib/language-storage"
import {
  DollarSign,
  Send,
  Receipt,
  Clock,
  FileText,
  LogOut,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  HelpCircle,
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [showBalance, setShowBalance] = useState(false)
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false)
  const [balance] = useState(532075) // Mock balance in paise (₹5,320.75)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push("/auth")
      return
    }
    setUser(storedUser)
  }, [router])

  const handleLogout = () => {
    clearStoredUser()
    router.push("/onboarding")
  }

  const handleBalanceToggle = () => {
    if (showBalance) {
      setShowBalance(false)
    } else {
      setIsPinDialogOpen(true)
    }
  }

  const handlePinSuccess = () => {
    setShowBalance(true)
    setIsPinDialogOpen(false)
  }

  const recentTransactions = [
    { id: 1, type: "received", amount: 15000, description: "Salary Payment", date: "Today" },
    { id: 2, type: "sent", amount: -4550, description: "Grocery Store", date: "Yesterday" },
    { id: 3, type: "sent", amount: -2500, description: "Mobile Recharge", date: "2 days ago" },
  ]

  const formatRupees = (amountInPaise: number) => {
    const rupees = amountInPaise / 100
    return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <BankEaseLogo size="sm" className="text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold">Hello, {user.name.split(" ")[0]}!</h1>
              <p className="text-primary-foreground/80">Welcome back to BankEase</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-12 w-12 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-primary-foreground/10 border-primary-foreground/20 shadow-banking">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-primary-foreground/80 text-base font-medium">Available Balance</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBalanceToggle}
                className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/10 touch-target"
              >
                {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
            <div className="text-4xl font-bold text-primary-foreground">
              {showBalance ? formatRupees(balance) : "••••••••"}
            </div>
            {!showBalance && (
              <p className="text-sm text-primary-foreground/60 mt-2">Tap the eye icon to view your balance</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/balance")}
              variant="outline"
              className="h-24 flex-col gap-3 bg-card hover:bg-accent/10 border-2 rounded-2xl shadow-banking touch-target"
            >
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-sm font-semibold">Check Balance</span>
            </Button>

            <Button
              onClick={() => router.push("/send-money")}
              variant="outline"
              className="h-24 flex-col gap-3 bg-card hover:bg-accent/10 border-2 rounded-2xl shadow-banking touch-target"
            >
              <Send className="h-8 w-8 text-accent" />
              <span className="text-sm font-semibold">Send Money</span>
            </Button>

            <Button
              onClick={() => router.push("/pay-bills")}
              variant="outline"
              className="h-24 flex-col gap-3 bg-card hover:bg-accent/10 border-2 rounded-2xl shadow-banking touch-target"
            >
              <Receipt className="h-8 w-8 text-secondary" />
              <span className="text-sm font-semibold">Pay Bills</span>
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
            <Button
              variant="ghost"
              onClick={() => router.push("/transactions")}
              className="text-primary hover:text-primary/80 font-medium"
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} className="border border-border shadow-banking rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === "received"
                            ? "bg-success/10 dark:bg-success/20"
                            : "bg-destructive/10 dark:bg-destructive/20"
                        }`}
                      >
                        {transaction.type === "received" ? (
                          <ArrowDownLeft className="h-6 w-6 text-success" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-base">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div
                      className={`font-bold text-lg ${
                        transaction.type === "received" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "received" ? "+" : ""}
                      {formatRupees(Math.abs(transaction.amount))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Secondary Actions */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">More Services</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => router.push("/transactions")}
              variant="outline"
              className="h-20 justify-start gap-4 bg-card hover:bg-accent/10 border-2 rounded-2xl shadow-banking touch-target"
            >
              <Clock className="h-6 w-6 text-muted-foreground" />
              <span className="font-semibold">Transaction History</span>
            </Button>

            <Button
              onClick={() => router.push("/statement")}
              variant="outline"
              className="h-20 justify-start gap-4 bg-card hover:bg-accent/10 border-2 rounded-2xl shadow-banking touch-target"
            >
              <FileText className="h-6 w-6 text-muted-foreground" />
              <span className="font-semibold">Mini Statement</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <Button
        onClick={() => router.push("/help")}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-banking-lg touch-target"
        size="icon"
      >
        <HelpCircle className="h-7 w-7" />
      </Button>

      <PinInputDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        title="Enter PIN to View Balance"
        description="Please enter your 4-digit PIN to view your account balance"
      />
    </div>
  )
}
