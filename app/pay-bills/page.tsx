"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStoredUser } from "@/lib/language-storage"
import { ArrowLeft, Zap, Droplets, Smartphone, Flame, DollarSign, CheckCircle, AlertCircle } from "lucide-react"

type BillCategory = "electricity" | "water" | "mobile" | "gas"
type Step = "category" | "details" | "amount" | "confirm" | "pin" | "success"

export default function PayBillsPage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>("category")
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push("/auth")
      return
    }
    setUser(storedUser)
  }, [router])

  const billCategories = [
    {
      id: "electricity" as BillCategory,
      name: "Electricity",
      icon: Zap,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      description: "Pay your electricity bill",
    },
    {
      id: "water" as BillCategory,
      name: "Water",
      icon: Droplets,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Pay your water bill",
    },
    {
      id: "mobile" as BillCategory,
      name: "Mobile Recharge",
      icon: Smartphone,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Recharge your mobile phone",
    },
    {
      id: "gas" as BillCategory,
      name: "Gas",
      icon: Flame,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      description: "Pay your gas bill",
    },
  ]

  const selectedCategoryData = billCategories.find((cat) => cat.id === selectedCategory)

  const handleCategorySelect = (category: BillCategory) => {
    setSelectedCategory(category)
    setCurrentStep("details")
  }

  const handleDetailsNext = () => {
    if (!accountNumber) {
      setError("Please enter your account number")
      return
    }
    setError("")
    setCurrentStep("amount")
  }

  const handleAmountNext = () => {
    const amountNum = Number.parseFloat(amount)
    if (!amount || amountNum <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (amountNum > 2450.75) {
      // Mock balance check
      setError("Insufficient balance")
      return
    }
    setError("")
    setCurrentStep("confirm")
  }

  const handleConfirm = () => {
    setCurrentStep("pin")
  }

  const handlePinSubmit = async () => {
    if (pin !== user?.pin) {
      setError("Incorrect PIN. Please try again.")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setCurrentStep("success")
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (currentStep === "category" ? router.push("/dashboard") : setCurrentStep("category"))}
            className="h-12 w-12 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Pay Bills</h1>
            <p className="text-primary-foreground/80">
              {currentStep === "category" && "Select bill type"}
              {currentStep === "details" && "Enter account details"}
              {currentStep === "amount" && "Enter amount"}
              {currentStep === "confirm" && "Confirm payment"}
              {currentStep === "pin" && "Enter PIN"}
              {currentStep === "success" && "Payment complete"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {["category", "details", "amount", "confirm", "pin", "success"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    ["category", "details", "amount", "confirm", "pin", "success"].indexOf(currentStep) >= index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 5 && (
                  <div
                    className={`w-6 h-0.5 ${
                      ["category", "details", "amount", "confirm", "pin", "success"].indexOf(currentStep) > index
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "category" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select Bill Type</CardTitle>
                <CardDescription>Choose the type of bill you want to pay</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {billCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant="outline"
                    onClick={() => handleCategorySelect(category.id)}
                    className="h-20 justify-start gap-4 border-2 hover:bg-accent/10"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${category.bgColor}`}>
                      <Icon className={`h-7 w-7 ${category.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-base">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {currentStep === "details" && selectedCategoryData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedCategoryData.icon className={`h-5 w-5 ${selectedCategoryData.color}`} />
                {selectedCategoryData.name}
              </CardTitle>
              <CardDescription>Enter your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">{selectedCategory === "mobile" ? "Phone Number" : "Account Number"}</Label>
                <Input
                  id="account"
                  type={selectedCategory === "mobile" ? "tel" : "text"}
                  placeholder={selectedCategory === "mobile" ? "+1234567890" : "Enter account number"}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button onClick={handleDetailsNext} className="w-full h-12 text-base">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "amount" && selectedCategoryData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Enter Amount
              </CardTitle>
              <CardDescription>
                {selectedCategoryData.name} - {accountNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Pay</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-12 text-base text-center text-2xl font-semibold"
                    step="0.01"
                    min="0.01"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">Available balance: $2,450.75</div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button onClick={handleAmountNext} className="w-full h-12 text-base">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "confirm" && selectedCategoryData && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Payment</CardTitle>
              <CardDescription>Please review the details before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Bill Type</span>
                  <div className="flex items-center gap-2">
                    <selectedCategoryData.icon className={`h-4 w-4 ${selectedCategoryData.color}`} />
                    <span className="font-medium">{selectedCategoryData.name}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">
                    {selectedCategory === "mobile" ? "Phone Number" : "Account Number"}
                  </span>
                  <span className="font-medium">{accountNumber}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-primary">${Number.parseFloat(amount).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <span className="text-2xl font-bold">${Number.parseFloat(amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleConfirm} className="w-full h-12 text-base bg-accent hover:bg-accent/90">
                Confirm & Pay
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "pin" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter PIN</CardTitle>
              <CardDescription>Enter your 4-digit PIN to authorize this payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                    setPin(value)
                  }}
                  className="h-12 text-base text-center tracking-widest text-2xl"
                  maxLength={4}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handlePinSubmit}
                disabled={pin.length !== 4 || isLoading}
                className="w-full h-12 text-base"
              >
                {isLoading ? "Processing Payment..." : "Pay Now"}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "success" && selectedCategoryData && (
          <Card className="text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground">Your bill has been paid successfully</p>
              </div>

              <div className="space-y-3 text-left bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Type</span>
                  <span className="font-semibold">{selectedCategoryData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-semibold">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">${Number.parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">PAY{Date.now().toString().slice(-8)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => router.push("/dashboard")} className="w-full h-12 text-base">
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("category")
                    setSelectedCategory(null)
                    setAccountNumber("")
                    setAmount("")
                    setPin("")
                    setError("")
                  }}
                  className="w-full h-12 text-base"
                >
                  Pay Another Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
