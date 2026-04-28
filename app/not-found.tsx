import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex min-h-screen w-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg bg-background/95 p-6 text-center">

        <p className="text-5xl font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">What were you thinking?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Other than consuming water... which is actually good for your health.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app">Open app</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
