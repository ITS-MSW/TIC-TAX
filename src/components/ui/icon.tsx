import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { withUniwind } from "uniwind";

// Retained icon adapter: HeroUI Native does not provide a general-purpose icon set.
const StyledIonicons = withUniwind(Ionicons);

export type IconProps = Omit<ComponentProps<typeof StyledIonicons>, "name"> & {
  name: ComponentProps<typeof Ionicons>["name"];
};

export type IconName = IconProps["name"];

export function Icon({ name, size = 20, ...props }: IconProps) {
  return <StyledIonicons name={name} size={size} {...props} />;
}
