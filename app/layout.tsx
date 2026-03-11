import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono, JetBrains_Mono, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShortcutHintProvider } from "@/components/shortcut-hint/shortcut-hint";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: "variable",
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "Hydroloop",
  description: "Stay on track with gentle reminders. Every sip counts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)}>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          archivo.variable,
          pixelifySans.variable,
          "antialiased"
        )}
      >
        <TooltipProvider>
          <ShortcutHintProvider>
            <div className="mx-auto flex min-h-screen w-full flex-col md:max-w-[50vw]">
              {children}
            </div>
            <Toaster />
          </ShortcutHintProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
