import { SplashGate } from "@/components/shared/splash-gate";
import { AuthGate } from "@/components/auth/auth-gate";
import { MainPage } from "@/screens/main";

export default function AppPage() {
  return (
    <AuthGate>
      <SplashGate>
        <MainPage />
      </SplashGate>
    </AuthGate>
  );
}

