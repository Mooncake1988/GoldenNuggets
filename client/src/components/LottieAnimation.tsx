import Lottie, { LottieComponentProps } from "lottie-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  onComplete?: () => void;
}

export default function LottieAnimation({
  animationData,
  loop = true,
  autoplay = true,
  className,
  onComplete,
}: LottieAnimationProps) {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldAnimate(!mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldAnimate(!e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!shouldAnimate) {
    return null;
  }

  const lottieProps: LottieComponentProps = {
    animationData,
    loop,
    autoplay,
    className: cn(className),
    onComplete,
  };

  return <Lottie {...lottieProps} />;
}
