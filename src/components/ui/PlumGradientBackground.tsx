import {
  Canvas,
  Circle,
  Fill,
  Group,
  BlurMask,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Retained visual background for Pulse/Runway; this Skia scene is not a UI control.
export function PlumGradientBackground() {
  return (
    <Canvas style={{ position: "absolute", top: 0, left: 0, width, height }}>
      {/* Base dark plum background */}
      <Fill color="#06000A" />

      {/* Soft plum glow - top left */}
      <Group>
        <BlurMask blur={80} style="normal" />
        <Circle
          cx={width * 0.2}
          cy={height * 0.15}
          r={width * 0.4}
          color="#a59ab2"
          opacity={0.4}
        />
      </Group>

      {/* Deep plum accent - top right */}
      <Group>
        <BlurMask blur={100} style="normal" />
        <Circle
          cx={width * 0.8}
          cy={height * 0.1}
          r={width * 0.35}
          color="#ffff"
          opacity={0.35}
        />
      </Group>

      {/* Subtle charcoal plum - center */}
      <Group>
        <BlurMask blur={120} style="normal" />
        <Circle
          cx={width * 0.5}
          cy={height * 0.25}
          r={width * 0.8}
          color="#190924"
          opacity={0.3}
        />
      </Group>

      {/* Midnight plum gradient overlay for depth */}
      <Group>
        <BlurMask blur={60} style="normal" />
        <Circle
          cx={width * 0.9}
          cy={height * 0.3}
          r={width * 0.3}
          color="#0E0314"
          opacity={0.5}
        />
      </Group>
    </Canvas>
  );
}
