import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { UserData } from "@/lib/types";

type AppShellProps = {
  children: React.ReactNode;
  userData?: UserData | null;
  onOpenSettings?: () => void;
};

export function AppShell({
  children,
  userData = null,
  onOpenSettings = () => {},
}: AppShellProps) {
  return (
    <>
      <Navbar userData={userData} onOpenSettings={onOpenSettings} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
