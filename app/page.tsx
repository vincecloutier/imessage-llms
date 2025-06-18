"use client"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { signIn, verifyOTP } from "@/lib/supabase/client"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export default function Page() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      localStorage.setItem("rememberedEmail", email)
      await signIn(email)
      toast.success("OTP sent successfully.", {
        description: "Please check your email for the verification code.",
      })
      setStep("otp")
    } catch (error: any) {
      toast.error("OTP could not be sent.", {
        description: `${error.message}${error.message.endsWith(".") ? "" : "."}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await verifyOTP(email, otp)
      toast.success("Successfully signed in!")
      router.push("/chat/0") 
      router.refresh();
    } catch (error: any) {
      toast.error("Invalid OTP.", {
        description: `${error.message}${error.message.endsWith(".") ? "" : "."}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      await signIn(email)
      toast.success("OTP resent successfully.", {
        description: "Please check your email for the new verification code.",
      })
    } catch (error: any) {
      toast.error("Failed to resend OTP.", {
        description: `${error.message}${error.message.endsWith(".") ? "" : "."}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Connect with April</h2>
              <p className="text-sm text-muted-foreground">Enter your email to continue</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending code..." : "Continue"}
                {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Enter your one time password.</h2>
              <p className="text-sm text-muted-foreground">
                We sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isLoading}
                  containerClassName="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="size-12"/>
                    <InputOTPSlot index={1} className="size-12"/>
                    <InputOTPSlot index={2} className="size-12"/>
                    <InputOTPSlot index={3} className="size-12"/>
                    <InputOTPSlot index={4} className="size-12"/>
                    <InputOTPSlot index={5} className="size-12"/>
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="link"
                  type="button"
                  className="w-auto"
                  onClick={() => {
                    setStep("email")
                    setOtp("")
                  }}
                  disabled={isLoading}
                >
                  Back 
                </Button>
                <Button type="submit" className="w-auto" disabled={isLoading || otp.length < 6}>
                  {isLoading ? "Verifying..." : "Verify"}
                  {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                </Button>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive a OTP?{" "}
              <Button variant="link" className="p-0 h-auto" disabled={isLoading} onClick={handleResendCode}>
                Resend OTP
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}