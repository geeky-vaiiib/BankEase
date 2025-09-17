"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getStoredUser } from "@/lib/language-storage"
import { ArrowLeft, Search, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react"

export default function TransactionsPage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all")
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push("/auth")
      return
    }
    setUser(storedUser)
  }, [router])

  const allTransactions = [
    {
      id: 1,
      type: "credit",
      amount: 150.0,
      description: "Salary Payment",
      date: "Dec 15, 2024",
      time: "10:30 AM",
      category: "Income",
    },
    {
      id: 2,
      type: "debit",
      amount: -45.5,
      description: "Grocery Store",
      date: "Dec 14, 2024",
      time: "3:45 PM",
      category: "Shopping",
    },
    {
      id: 3,
      type: "debit",
      amount: -25.0,
      description: "Mobile Recharge",
      date: "Dec 13, 2024",
      time: "11:20 AM",
      category: "Bills",
    },
    {
      id: 4,
      type: "credit",
      amount: 75.0,
      description: "Refund",
      date: "Dec 12, 2024",
      time: "2:15 PM",
      category: "Refund",
    },
    {
      id: 5,
      type: "debit",
      amount: -120.0,
      description: "Electricity Bill",
      date: "Dec 11, 2024",
      time: "9:00 AM",
      category: "Bills",
    },
    {
      id: 6,
      type: "debit",
      amount: -30.0,
      description: "Coffee Shop",
      date: "Dec 10, 2024",
      time: "8:15 AM",
      category: "Food",
    },
    {
      id: 7,
      type: "credit",
      amount: 200.0,
      description: "Freelance Payment",
      date: "Dec 9, 2024",
      time: "4:30 PM",
      category: "Income",
    },
    {
      id: 8,
      type: "debit",
      amount: -85.0,
      description: "Gas Station",
      date: "Dec 8, 2024",
      time: "7:20 PM",
      category: "Transport",
    },
  ]

  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || transaction.type === filterType
    return matchesSearch && matchesFilter
  })

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
            <h1 className="text-xl font-bold">Transaction History</h1>
            <p className="text-primary-foreground/80">All your recent transactions</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={filterType === "credit" ? "default" : "outline"}
              onClick={() => setFilterType("credit")}
              className="flex-1"
            >
              Received
            </Button>
            <Button
              variant={filterType === "debit" ? "default" : "outline"}
              onClick={() => setFilterType("debit")}
              className="flex-1"
            >
              Sent
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === "credit"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <ArrowDownLeft className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.date} • {transaction.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-semibold text-lg ${
                          transaction.type === "credit"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <Card className="border-2 border-primary/20 bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Showing {filteredTransactions.length} transactions</p>
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total In</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      +$
                      {filteredTransactions
                        .filter((t) => t.type === "credit")
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total Out</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      $
                      {Math.abs(
                        filteredTransactions.filter((t) => t.type === "debit").reduce((sum, t) => sum + t.amount, 0),
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
