"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { SPLASH_FROM_LANDING_KEY } from "@/constants";
import { ArrowRight, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WaterFillCtaProps = {
  href?: string;
  className?: string;
  label?: string;
};

export function WaterFillCta({
  href = "/app",
  className,
  label = "Start tracking",
}: WaterFillCtaProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);

  const onClick = () => {
    if (animating) return;
    setAnimating(true);
  };

  return (
    <Button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative overflow-hidden gap-2", className)}
      aria-label={label}
    >
      <span className="relative z-10 flex items-center gap-2">
        <Droplets className="h-4 w-4" />
        {label}
        <ArrowRight className="h-4 w-4 translate-x-0 transition-transform duration-200 group-hover/button:translate-x-0.5" />
      </span>

      <motion.span
        aria-hidden="true"
        className="absolute inset-0 z-0 origin-left bg-gradient-to-r from-[oklch(0.623_0.214_259.815)] via-[oklch(0.809_0.105_251.813)] to-[oklch(0.85_0.08_252)]"
        initial={{ scaleX: 0 }}
        animate={animating ? { scaleX: 1 } : hovered ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: animating ? 0.35 : 0.45,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        onAnimationComplete={() => {
          if (!animating) return;
          if (href === "/app") {
            try {
              sessionStorage.setItem(SPLASH_FROM_LANDING_KEY, "1");
            } catch {
              // ignore
            }
          }
          router.push(href);
          setTimeout(() => setAnimating(false), 350);
        }}
      />
    </Button>
  );
}

