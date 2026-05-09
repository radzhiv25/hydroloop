import { Suspense } from "react"
import { AuthScreen } from "@/components/auth/auth-screen"

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-1 items-center justify-center bg-background p-4">
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
        </div>
      }
    >
      <AuthScreen />
    </Suspense>
  )
}
