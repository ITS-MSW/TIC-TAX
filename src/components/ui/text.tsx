import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";

// Retained typography adapter: HeroUI Native has no standalone Text primitive.
const text = tv({
  base: "text-left",
  variants: {
    variant: {
      default: "text-base leading-6 font-medium text-foreground/80",
      title:
        "text-5xl font-semibold leading-[52px] text-foreground text-primary",
      subtitle: "text-[32px] leading-[40px] font-semibold text-foreground",
      large: "text-xl font-semibold leading-7 text-foreground",
      small: "text-sm leading-5 font-medium text-foreground/80",
      smallBold: "text-sm leading-5 font-bold text-foreground",
      xs: "text-xs leading-5 font-medium text-foreground/40",
      xsBold: "text-xs leading-5 font-bold text-foreground",
      link: "text-sm leading-[30px] text-secondary font-semibold",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type TextVariants = VariantProps<typeof text>;

export type TextProps = RNTextProps & TextVariants;

export function Text({ variant, className, ...rest }: TextProps) {
  return <RNText className={text({ variant, className })} {...rest} />;
}
