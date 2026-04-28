import Link from "next/link";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg bg-card p-6 text-center">
        {/* <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted">
          <Droplets className="h-5 w-5 text-primary" />
        </div> */}

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
