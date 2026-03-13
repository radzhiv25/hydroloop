"use client";

import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { PRODUCT_NAME } from "@/constants";
import { GlassWater } from "lucide-react";
import { motion } from "motion/react";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <motion.section
      className="flex flex-col items-center text-center max-w-xl mx-auto py-12 px-4"
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
      variants={{
        animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
      }}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-3">
        <GlassWater className="h-12 w-12 shrink-0 text-foreground" strokeWidth={1.5} />
        <TypographyH1 className="font-archivo">
          {PRODUCT_NAME}
        </TypographyH1>
      </motion.div>
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mt-4">
        <TypographyLead className="font-archivo">
          Stay on track with gentle reminders. Every sip counts.
        </TypographyLead>
      </motion.div>
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mt-2">
        <TypographyMuted className="font-archivo">
          Your daily hydration companion
        </TypographyMuted>
      </motion.div>
    </motion.section>
  );
}
