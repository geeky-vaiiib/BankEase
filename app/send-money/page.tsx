"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStoredUser } from "@/lib/language-storage"
import { api, ApiError } from "@/lib/api"
import { ArrowLeft, Phone, DollarSign, User, Users, CheckCircle, AlertCircle } from "lucide-react"

type Step = "recipient" | "amount" | "confirm" | "pin" | "success"

export default function SendMoneyPage() {
  const [user, setUser] = useState<{ name: string; pin: string } | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>("recipient")
  const [recipient, setRecipient] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [transactionResult, setTransactionResult] = useState<any>(null)
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

      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.push("/auth")
          return
        }
        console.error("Send money page error:", error)
      }
    }

    fetchData()
  }, [router])

  const contacts = [
    { name: "John Smith", phone: "+1234567890" },
    { name: "Sarah Johnson", phone: "+1234567891" },
    { name: "Mike Wilson", phone: "+1234567892" },
    { name: "Lisa Brown", phone: "+1234567893" },
  ]

  const handleRecipientNext = () => {
    if (!recipient) {
      setError("Please enter a phone number or select a contact")
      return
    }

    // For demo purposes, we'll allow any phone number and set a placeholder name
    // In a real app, you might want to validate the phone number format
    const contact = contacts.find((c) => c.phone === recipient)
    setRecipientName(contact?.name || "User")
    setError("")
    setCurrentStep("amount")
  }

  const handleAmountNext = () => {
    const amountNum = Number.parseFloat(amount)
    if (!amount || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }
    if (amountNum < 0.01) {
      setError("Minimum transfer amount is $0.01")
      return
    }
    if (amountNum > balance) {
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
    if (!pin || pin.length !== 4) {
      setError("Please enter your 4-digit PIN")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Call the send money API
      const response = await api.sendMoney({
        to: recipient,
        amount: parseFloat(amount)
      })

      if (response.success) {
        setTransactionResult(response.data)
        setBalance(response.data.newBalance) // Update balance
        setCurrentStep("success")
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError("Transaction failed. Please try again.")
      }
      console.error("Send money error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectContact = (contact: (typeof contacts)[0]) => {
    setRecipient(contact.phone)
    setRecipientName(contact.name)
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
            onClick={() => (currentStep === "recipient" ? router.push("/dashboard") : setCurrentStep("recipient"))}
            className="h-12 w-12 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Send Money</h1>
            <p className="text-primary-foreground/80">
              {currentStep === "recipient" && "Choose recipient"}
              {currentStep === "amount" && "Enter amount"}
              {currentStep === "confirm" && "Confirm details"}
              {currentStep === "pin" && "Enter PIN"}
              {currentStep === "success" && "Transaction complete"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {["recipient", "amount", "confirm", "pin", "success"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    ["recipient", "amount", "confirm", "pin", "success"].indexOf(currentStep) >= index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      ["recipient", "amount", "confirm", "pin", "success"].indexOf(currentStep) > index
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
        {currentStep === "recipient" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Enter Phone Number
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Recipient's Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button onClick={handleRecipientNext} className="w-full h-12 text-base">
                  Continue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Or Select from Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contacts.map((contact) => (
                  <Button
                    key={contact.phone}
                    variant="outline"
                    onClick={() => selectContact(contact)}
                    className="w-full h-16 justify-start gap-3 border-2"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "amount" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Enter Amount
              </CardTitle>
              <CardDescription>
                Sending to: {recipientName} ({recipient})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Send</Label>
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

              <div className="text-center text-sm text-muted-foreground">Available balance: ${balance.toFixed(2)}</div>

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

        {currentStep === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Transaction</CardTitle>
              <CardDescription>Please review the details before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Recipient</span>
                  <div className="text-right">
                    <p className="font-medium">{recipientName}</p>
                    <p className="text-sm text-muted-foreground">{recipient}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-primary">${Number.parseFloat(amount).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Transaction Fee</span>
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
                Confirm & Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "pin" && (
          <Card>
            <CardHeader>
              <CardTitle>Enter PIN</CardTitle>
              <CardDescription>Enter your 4-digit PIN to authorize this transaction</CardDescription>
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
                {isLoading ? "Processing..." : "Send Money"}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "success" && (
          <Card className="text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Money Sent Successfully!</h2>
                <p className="text-muted-foreground">Your transaction has been completed</p>
              </div>

              <div className="space-y-3 text-left bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Sent</span>
                  <span className="font-semibold">${Number.parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-semibold">{transactionResult?.recipient?.name || recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{transactionResult?.transactionId || "TXN" + Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Balance</span>
                  <span className="font-semibold">${balance.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => router.push("/dashboard")} className="w-full h-12 text-base">
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("recipient")
                    setRecipient("")
                    setRecipientName("")
                    setAmount("")
                    setPin("")
                    setError("")
                    setTransactionResult(null)
                  }}
                  className="w-full h-12 text-base"
                >
                  Send Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
