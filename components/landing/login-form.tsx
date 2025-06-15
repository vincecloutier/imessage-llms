"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { signIn, verifyOTP } from "@/lib/supabase/client"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberEmail(true)
    }
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (rememberEmail) {
        localStorage.setItem("rememberedEmail", email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }
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
      await signIn(email) // Resend OTP to the same email
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
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      {step === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Connect with April</h2>
            <p className="text-sm text-muted-foreground">Enter your email to continue.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="rounded-full"
              />
            </div>
            <div className="flex justify-between w-full gap-12">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberEmail} onCheckedChange={(checked) => setRememberEmail(checked === true)} disabled={isLoading} />
                <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember Me?
                </label>
              </div>
              <Button type="submit" className="rounded-full" disabled={isLoading}>
                {isLoading ? "Sending code..." : "Continue"}
                {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              </Button>
            </div>
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
                  <InputOTPSlot index={0} className="h-12 w-12"/>
                  <InputOTPSlot index={1} className="h-12 w-12"/>
                  <InputOTPSlot index={2} className="h-12 w-12"/>
                  <InputOTPSlot index={3} className="h-12 w-12"/>
                  <InputOTPSlot index={4} className="h-12 w-12"/>
                  <InputOTPSlot index={5} className="h-12 w-12"/>
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
                  setOtp("") // Clear OTP when going back
                }}
                disabled={isLoading}
              >
                Back 
              </Button>
              <Button type="submit" className="w-auto rounded-full" disabled={isLoading || otp.length < 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive a code?{" "}
            <Button variant="link" className="p-0 h-auto" disabled={isLoading} onClick={handleResendCode}>
              Resend code
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
