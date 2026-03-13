import { SplashGate } from "@/components/shared/splash-gate";
import { MainPage } from "@/screens/main";

export default function AppPage() {
  return (
    <SplashGate>
      <MainPage />
    </SplashGate>
  );
}

