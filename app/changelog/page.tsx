"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  webChangelog,
  cliChangelog,
  type ChangelogRelease,
} from "@/lib/changelog-data";

function ChangelogList({ releases }: { releases: ChangelogRelease[] }) {
  return (
    <section className="space-y-6">
      {releases.map((release) => (
        <article
          key={release.version}
          className="rounded-lg border bg-card p-4 shadow-sm space-y-2"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-medium">Version {release.version}</h2>
            <span className="text-xs text-muted-foreground">{release.date}</span>
          </div>
          <ul className="list-disc list-inside text-sm space-y-1">
            {release.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

export default function ChangelogPage() {
  const [tab, setTab] = useState("web");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="site" />

      <main className="mx-auto w-full flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Changelog
            </h1>
            <p className="text-sm text-muted-foreground">
              Notable changes to the web app and CLI.
            </p>
            <Link
              href="/app"
              className="inline-flex text-sm text-primary underline underline-offset-4"
            >
              ← Back to app
            </Link>
          </header>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2" variant="default">
              <TabsTrigger value="web" className="flex-1">
                Web
              </TabsTrigger>
              <TabsTrigger value="cli" className="flex-1">
                CLI
              </TabsTrigger>
            </TabsList>
            <TabsContent value="web" className="mt-6">
              <ChangelogList releases={webChangelog} />
            </TabsContent>
            <TabsContent value="cli" className="mt-6">
              <ChangelogList releases={cliChangelog} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

