"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"
import { getOrCreateUserData, saveUserData } from "@/lib/storage"
import { MAX_DAILY_GOAL, MIN_DAILY_GOAL } from "@/constants/hydration"

type AuthSubmitButtonProps = {
  label: string
  disabled?: boolean
}

type SignupFormData = {
  name: string
  username: string
  email: string
  password: string
  confirmPassword: string
  weightKg: string
  acceptedTerms: boolean
}

type LoginFormData = {
  email: string
  password: string
}

type SignupFormProps = {
  loading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onGoogle: () => void
  value: SignupFormData
  onChange: (next: Partial<SignupFormData>) => void
}

type LoginFormProps = {
  loading: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onGoogle: () => void
  value: LoginFormData
  onChange: (next: Partial<LoginFormData>) => void
}

const DEFAULT_APP_URL = "https://loophydro.vercel.app"

function getAppBaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, "")
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "")
  }
  return DEFAULT_APP_URL
}

function getSignupErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "Signup failed"
  const maybeCode = "code" in error ? String(error.code ?? "") : ""
  const maybeMessage = "message" in error ? String(error.message ?? "") : ""
  const lower = maybeMessage.toLowerCase()

  if (
    maybeCode === "unexpected_failure" ||
    lower.includes("database error saving new user") ||
    lower.includes("duplicate key") ||
    lower.includes("username")
  ) {
    return "Username already exists. Please choose another one."
  }

  return maybeMessage || "Signup failed"
}

function AuthSubmitButton({ label, disabled = false }: AuthSubmitButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Button
      type="submit"
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-10 w-full overflow-hidden text-xs"
    >
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {label}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200"
          style={{ transform: hovered ? "translateX(2px)" : "translateX(0)" }}
        />
      </span>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 z-0 origin-left bg-linear-to-r from-[oklch(0.623_0.214_259.815)] via-[oklch(0.809_0.105_251.813)] to-[oklch(0.85_0.08_252)]"
        initial={{ scaleX: 0 }}
        animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </Button>
  )
}

function GoogleSigninButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative flex h-10 w-full items-center justify-center gap-2 border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_-1px_0_rgba(20,20,20,0.05)_inset,0_8px_16px_rgba(18,28,45,0.08)] transition-all hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_-1px_0_rgba(20,20,20,0.05)_inset,0_12px_20px_rgba(18,28,45,0.12)] active:translate-y-0"
    >
      <FcGoogle className="size-4" aria-hidden="true" />
      {label}
      <span className="pointer-events-none absolute inset-0 border border-zinc-950/5" />
    </button>
  )
}

function recommendedGoalFromWeight(weightKg: number): number {
  const raw = Math.round(weightKg * 35)
  return Math.max(MIN_DAILY_GOAL, Math.min(MAX_DAILY_GOAL, raw))
}

/** L-corner accents meeting exactly at corners (no transforms — avoids broken bottom alignment). */
function AuthCornerFrame() {
  const line = "pointer-events-none absolute z-20 bg-blue-500/70"
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      <span className={`${line} left-0 top-0 h-px w-6`} />
      <span className={`${line} left-0 top-0 h-6 w-px`} />

      <span className={`${line} right-0 top-0 h-px w-6`} />
      <span className={`${line} right-0 top-0 h-6 w-px`} />

      <span className={`${line} -bottom-5 left-0 h-px w-6`} />
      <span className={`${line} -bottom-5 left-0 h-6 w-px`} />

      <span className={`${line} -bottom-5 right-0 h-px w-6`} />
      <span className={`${line} -bottom-5 right-0 h-6 w-px`} />
    </div>
  )
}

function SignupForm({ loading, onSubmit, onGoogle, value, onChange }: SignupFormProps) {
  const parsedWeight = value.weightKg.trim() ? Number(value.weightKg) : null
  const recommendedGoal =
    parsedWeight != null && Number.isFinite(parsedWeight) && parsedWeight > 0
      ? recommendedGoalFromWeight(parsedWeight)
      : null

  return (
    <form className="relative overflow-visible space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Alex Johnson"
          value={value.name}
          onChange={(event) => onChange({ name: event.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-username">Username (optional)</Label>
        <Input
          id="signup-username"
          type="text"
          placeholder="alexj"
          value={value.username}
          onChange={(event) => onChange({ username: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="alex@hydroloop.app"
          value={value.email}
          onChange={(event) => onChange({ email: event.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={value.password}
          onChange={(event) => onChange({ password: event.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
        <Input
          id="signup-confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={value.confirmPassword}
          onChange={(event) => onChange({ confirmPassword: event.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-weight">Weight (kg, optional)</Label>
        <Input
          id="signup-weight"
          type="number"
          min={20}
          max={300}
          step={1}
          placeholder="70"
          value={value.weightKg}
          onChange={(event) => onChange({ weightKg: event.target.value })}
        />
        {recommendedGoal != null && (
          <p className="text-[11px] text-blue-600">
            Recommended daily intake: <span className="font-medium">{recommendedGoal} ml</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border border-border bg-muted/20 px-2.5 py-2">
        <Label htmlFor="signup-terms" className="text-[11px] text-muted-foreground">
          I agree to the terms and privacy policy
        </Label>
        <Switch
          id="signup-terms"
          checked={value.acceptedTerms}
          onCheckedChange={(checked) => onChange({ acceptedTerms: checked })}
        />
      </div>

      <AuthSubmitButton label={loading ? "Creating account..." : "Create account"} disabled={loading} />
      <GoogleSigninButton
        label="Sign up with Google"
        onClick={onGoogle}
        disabled={loading}
      />
    </form>
  )
}

function LoginForm({ loading, onSubmit, onGoogle, value, onChange }: LoginFormProps) {
  return (
    <form className="relative overflow-visible space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@hydroloop.app"
          value={value.email}
          onChange={(event) => onChange({ email: event.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={value.password}
          onChange={(event) => onChange({ password: event.target.value })}
          required
        />
      </div>

      <div className="flex items-center justify-between border border-border bg-muted/20 px-2.5 py-2">
        <Label htmlFor="login-remember" className="text-[11px] text-muted-foreground">
          Keep me signed in on this device
        </Label>
        <Switch id="login-remember" />
      </div>

      <AuthSubmitButton label={loading ? "Signing in..." : "Sign in"} disabled={loading} />
      <GoogleSigninButton
        label="Continue with Google"
        onClick={onGoogle}
        disabled={loading}
      />
    </form>
  )
}

function IllustrationPanel() {
  return (
    <div className="relative hidden min-h-screen border-r border-border/50 bg-linear-to-br from-cyan-500/15 via-indigo-500/10 to-blue-500/20 p-6 md:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(56,189,248,0.35),transparent_40%),radial-gradient(circle_at_75%_70%,rgba(99,102,241,0.3),transparent_42%)]" />
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        <div className="space-y-6">
          <div className="mx-auto flex w-fit flex-col items-center gap-3">
            <Image src="/icon.svg" alt="Hydroloop icon" width={72} height={72} />
          </div>

          <h2 className="mx-auto max-w-[28ch] text-2xl font-semibold tracking-tight text-foreground font-archivo">
            Build consistent hydration habits while you work.
          </h2>
          <p className="mx-auto max-w-[42ch] text-xs text-muted-foreground">
            Track water in seconds, stay on top of reminders, and keep your streak alive with Hydroloop.
          </p>
        </div>
      </div>
    </div>
  )
}

export function AuthScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()
  const authEnabled = isSupabaseConfigured()
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [signupData, setSignupData] = useState<SignupFormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    weightKg: "",
    acceptedTerms: false,
  })

  const nextPath = useMemo(() => searchParams.get("next") || "/app", [searchParams])

  useEffect(() => {
    if (!supabase) return
    let mounted = true
    void (async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data.session) router.replace(nextPath)
    })()
    return () => {
      mounted = false
    }
  }, [nextPath, router, supabase])

  async function upsertProfileFromUser(
    userId: string,
    payload: {
      display_name?: string
      username?: string
      weight_kg?: number | null
    }
  ) {
    await supabase.from("profiles").upsert({
      id: userId,
      display_name: payload.display_name ?? null,
      username: payload.username ?? null,
      weight_kg: payload.weight_kg ?? null,
    })
  }

  async function usernameExists(username: string) {
    const clean = username.trim()
    if (!clean) return false
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", clean)
      .limit(1)

    if (error) return false
    return (data?.length ?? 0) > 0
  }

  const handleGoogleSignin = async () => {
    if (!supabase) {
      toast.error("Cloud auth is not configured in this environment.")
      return
    }

    setLoading(true)
    const redirectTo = `${getAppBaseUrl()}/auth?next=${encodeURIComponent(nextPath)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })
    if (error) {
      toast.error(error.message || "Google sign-in failed")
      setLoading(false)
    }
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      toast.error("Cloud auth is not configured in this environment.")
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim(),
        password: loginData.password,
      })
      if (error) {
        toast.error(error.message || "Sign-in failed")
        setLoading(false)
        return
      }
      if (data.user) {
        await upsertProfileFromUser(data.user.id, {
          display_name: data.user.user_metadata?.full_name,
          username: data.user.user_metadata?.username,
          weight_kg: typeof data.user.user_metadata?.weight_kg === "number" ? data.user.user_metadata.weight_kg : null,
        })
      }
      toast.success("Signed in successfully")
      router.replace(nextPath)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed"
      toast.error(message)
      setLoading(false)
    }
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!supabase) {
      toast.error("Cloud auth is not configured in this environment.")
      return
    }

    if (!signupData.acceptedTerms) {
      toast.error("Please accept the terms and privacy policy")
      return
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (signupData.password.length < 6) {
      toast.error("Password should be at least 6 characters")
      return
    }

    const parsedWeight = signupData.weightKg.trim() ? Number(signupData.weightKg) : null
    if (parsedWeight != null && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      toast.error("Please enter a valid weight")
      return
    }
    const recommendedGoalMl = parsedWeight != null ? recommendedGoalFromWeight(parsedWeight) : null
    const username = signupData.username.trim()

    try {
      setLoading(true)
      if (username) {
        const exists = await usernameExists(username)
        if (exists) {
          toast.error("Username already exists. Please choose another one.")
          setLoading(false)
          return
        }
      }
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email.trim(),
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.name.trim(),
            username: username || null,
            weight_kg: parsedWeight,
          },
          emailRedirectTo: `${getAppBaseUrl()}/auth?next=${encodeURIComponent(nextPath)}`,
        },
      })
      if (error) {
        toast.error(getSignupErrorMessage(error))
        setLoading(false)
        return
      }

      if (data.user?.id) {
        try {
          await upsertProfileFromUser(data.user.id, {
            display_name: signupData.name.trim(),
            username: username || undefined,
            weight_kg: parsedWeight,
          })
        } catch (profileError) {
          const message =
            profileError instanceof Error ? profileError.message.toLowerCase() : ""
          if (message.includes("duplicate key") || message.includes("username")) {
            toast.error("Username already exists. Please choose another one.")
            setLoading(false)
            return
          }
          throw profileError
        }
      }

      toast.success("Account created. Check your email if verification is enabled.")
      const local = await getOrCreateUserData()
      const seeded = {
        ...local,
        name: signupData.name.trim() || local.name,
        daily_goal: recommendedGoalMl ?? local.daily_goal,
      }
      await saveUserData(seeded)
      if (data.session) {
        router.replace(nextPath)
        return
      }
      setLoading(false)
    } catch (error) {
      toast.error(getSignupErrorMessage(error))
      setLoading(false)
    }
  }

  return (
    <main className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-background">
      <section className="grid min-h-screen w-full grid-cols-1 bg-card md:grid-cols-2">
        <IllustrationPanel />

        <div className="flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-sm overflow-visible space-y-5 border border-border/70 bg-card/30 p-5 sm:p-6">
            <AuthCornerFrame />
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight font-archivo">
                Welcome back
              </h1>
              <p className="text-xs text-muted-foreground">
                Access your account or create a new one.
              </p>
            </div>

            {!authEnabled ? (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                Cloud auth is disabled in this local environment. Add Supabase env vars to test login and sync flows.
              </div>
            ) : null}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid h-10 w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <LoginForm
                  loading={loading || !authEnabled}
                  onSubmit={handleLogin}
                  onGoogle={handleGoogleSignin}
                  value={loginData}
                  onChange={(next) => setLoginData((prev) => ({ ...prev, ...next }))}
                />
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <SignupForm
                  loading={loading || !authEnabled}
                  onSubmit={handleSignup}
                  onGoogle={handleGoogleSignin}
                  value={signupData}
                  onChange={(next) => setSignupData((prev) => ({ ...prev, ...next }))}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </main>
  )
}
