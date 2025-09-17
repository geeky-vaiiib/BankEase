"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoredUser } from "@/lib/language-storage"
import { ArrowLeft, Download, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react"

export default function StatementPage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push("/auth")
      return
    }
    setUser(storedUser)
  }, [router])

  const handleDownload = async () => {
    setIsDownloading(true)
    // Simulate download
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading(false)
    alert("Statement downloaded successfully!")
  }

  const statementData = {
    accountNumber: "****1234",
    period: "December 1-15, 2024",
    openingBalance: 2325.25,
    closingBalance: 2450.75,
    totalCredits: 375.0,
    totalDebits: -249.5,
  }

  const transactions = [
    { id: 1, date: "Dec 15", type: "credit", amount: 150.0, description: "Salary Payment", balance: 2450.75 },
    { id: 2, date: "Dec 14", type: "debit", amount: -45.5, description: "Grocery Store", balance: 2300.75 },
    { id: 3, date: "Dec 13", type: "debit", amount: -25.0, description: "Mobile Recharge", balance: 2346.25 },
    { id: 4, date: "Dec 12", type: "credit", amount: 75.0, description: "Refund", balance: 2371.25 },
    { id: 5, date: "Dec 11", type: "debit", amount: -120.0, description: "Electricity Bill", balance: 2296.25 },
    { id: 6, date: "Dec 10", type: "debit", amount: -30.0, description: "Coffee Shop", balance: 2416.25 },
    { id: 7, date: "Dec 9", type: "credit", amount: 200.0, description: "Freelance Payment", balance: 2446.25 },
    { id: 8, date: "Dec 8", type: "debit", amount: -85.0, description: "Gas Station", balance: 2246.25 },
    { id: 9, date: "Dec 7", type: "debit", amount: -59.0, description: "Restaurant", balance: 2331.25 },
    { id: 10, date: "Dec 6", type: "debit", amount: -15.0, description: "Parking Fee", balance: 2390.25 },
  ]

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
            <h1 className="text-xl font-bold">Mini Statement</h1>
            <p className="text-primary-foreground/80">Account summary and recent transactions</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Account Summary */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Account Summary
            </CardTitle>
            <CardDescription>
              Account: {statementData.accountNumber} • Period: {statementData.period}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Opening Balance</p>
                <p className="text-lg font-semibold">${statementData.openingBalance.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Closing Balance</p>
                <p className="text-lg font-semibold text-primary">${statementData.closingBalance.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  +${statementData.totalCredits.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Debits</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ${Math.abs(statementData.totalDebits).toFixed(2)}
                </p>
              </div>
            </div>

            <Button onClick={handleDownload} disabled={isDownloading} className="w-full h-12 text-base">
              <Download className={`h-4 w-4 mr-2 ${isDownloading ? "animate-bounce" : ""}`} />
              {isDownloading ? "Downloading..." : "Download Full Statement"}
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Button
              variant="ghost"
              onClick={() => router.push("/transactions")}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          </div>

          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "credit"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}, 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          transaction.type === "credit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Bal: ${transaction.balance.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
          <Button onClick={() => router.push("/balance")} variant="outline" className="h-14 border-2">
            Check Balance
          </Button>
        </div>
      </div>
    </div>
  )
}
