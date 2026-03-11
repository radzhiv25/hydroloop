import { PRODUCT_NAME } from "@/constants";

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-3 px-4 mt-auto">
      <span className="text-xs text-muted-foreground font-archivo">
        © {new Date().getFullYear()} {PRODUCT_NAME}
      </span>
    </footer>
  );
}
