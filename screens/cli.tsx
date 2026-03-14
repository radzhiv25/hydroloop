"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { TerminalDemo } from "@/components/cli/terminal-demo";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ExternalLink, Copy, Check } from "lucide-react";

const NPM_URL = "https://www.npmjs.com/package/hydroloop";
const INSTALL_COMMAND = "npm install -g hydroloop";

export function CLIPage() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="site" />

      <main className="mx-auto w-full flex-1 px-4 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Hydroloop CLI
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Track your hydration from the terminal. Quick logging, background
              reminders, and streak tracking.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Install globally
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-none border border-border bg-muted/50 px-3 py-2.5 font-mono text-xs sm:px-4 sm:py-3 sm:text-sm">
                {INSTALL_COMMAND}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 sm:h-[46px] sm:w-[46px]"
                onClick={copyCommand}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
            <a
              href={NPM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              View on npm
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <TerminalDemo />

          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base font-semibold sm:text-lg">Commands</h2>
            <div className="grid gap-2 sm:gap-3">
              {[
                { cmd: "hydroloop add 250", desc: "Log 250ml of water" },
                { cmd: "hydroloop status", desc: "View today's progress" },
                { cmd: "hydroloop start", desc: "Start background reminders" },
                { cmd: "hydroloop stop", desc: "Stop reminders" },
                { cmd: "hydroloop streak", desc: "View your streak" },
                { cmd: "hydroloop goal 3000", desc: "Set daily goal to 3L" },
                { cmd: "hydroloop sound list", desc: "List available sounds" },
                { cmd: "hydroloop reminder 30", desc: "Set 30min interval" },
              ].map(({ cmd, desc }) => (
                <div
                  key={cmd}
                  className="flex flex-col gap-1 rounded-none border border-border bg-muted/30 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-2.5"
                >
                  <code className="font-mono text-xs sm:text-sm">{cmd}</code>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-none border border-border bg-muted/30 p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              <span className="font-medium text-foreground">Note:</span> The CLI
              stores data locally at{" "}
              <code className="text-[10px] sm:text-xs">
                ~/.config/hydroloop-nodejs/
              </code>
              . Data is separate from the web app.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
