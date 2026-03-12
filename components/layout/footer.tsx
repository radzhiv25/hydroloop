import { GlassWater } from "lucide-react";
import { PRODUCT_NAME } from "@/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-3 px-4 mt-auto">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-archivo">
        <GlassWater className="h-3.5 w-3.5 shrink-0" />
        © {new Date().getFullYear()} {PRODUCT_NAME}
      </span>
    </footer>
  );
}
