import { Typewriter } from "@/components/landing/typewriter";

type SplashPageProps = {
  onComplete: () => void;
};

export function SplashPage({ onComplete }: SplashPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4">
      <Typewriter onComplete={onComplete} />
    </div>
  );
}
