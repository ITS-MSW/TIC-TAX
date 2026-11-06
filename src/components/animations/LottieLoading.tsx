import LottieView from "lottie-react-native";
import { useRef } from "react";
import { View } from "react-native";

export interface LottieLoadingProps {
  size?: number;
}

// Retained custom motion consumed by FinanceSummary; HeroUI controls do not replace this asset.
export function LottieLoading({ size = 24 }: LottieLoadingProps) {
  const animationRef = useRef<LottieView>(null);

  return (
    <View style={{ width: size, height: size }}>
      <LottieView
        ref={animationRef}
        source={require("@/src/components/animations/lottie/devLottie.json")}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}
