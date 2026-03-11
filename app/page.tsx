import { SplashGate } from "@/components/splash-gate";
import { MainPage } from "@/views/main";

export default function Home() {
  return (
    <SplashGate>
      <MainPage />
    </SplashGate>
  );
}
