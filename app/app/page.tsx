import { SplashGate } from "@/components/splash-gate";
import { MainPage } from "@/views/main";

export default function AppPage() {
  return (
    <SplashGate>
      <MainPage />
    </SplashGate>
  );
}

