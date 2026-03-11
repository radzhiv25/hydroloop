import { Typewriter } from "@/components/typewriter";

type SplashPageProps = {
  onComplete: () => void;
};

export function SplashPage({ onComplete }: SplashPageProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <Typewriter onComplete={onComplete} />
    </div>
  );
}
