import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import type { UserData } from "@/lib/types";

type AppShellProps = {
  children: React.ReactNode;
  userData?: UserData | null;
  onOpenSettings?: () => void;
  /** When true, settings is open (used to trigger icon spin on keyboard shortcut). */
  settingsOpen?: boolean;
};

export function AppShell({
  children,
  userData = null,
  onOpenSettings = () => {},
  settingsOpen,
}: AppShellProps) {
  return (
    <>
      <Navbar userData={userData} onOpenSettings={onOpenSettings} settingsOpen={settingsOpen} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </>
  );
}
