import { View, type ViewProps } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type SafeArea = "top" | "bottom" | "both" | "none";

export interface SafeScreenProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: SafeArea;
  className?: string;
  contentClassName?: string;
}

const safeStyles: Record<SafeArea, string> = {
  top: "pt-safe-offset-1 pb-safe-offset-4",
  bottom: "pt-2 pb-safe-offset-24",
  both: "pt-safe-offset-1 pb-safe-offset-24",
  none: "pt-2 pb-safe-offset-4",
};

// Retained screen layout: owns safe-area spacing and keyboard-aware scrolling, not controls.
export function SafeScreen({
  children,
  scrollable = false,
  safeArea = "top",
  className = "",
  contentClassName = "",
  ...props
}: SafeScreenProps) {
  const safeAreaClasses = safeStyles[safeArea];

  if (!scrollable) {
    return (
      <View className={`flex-1 bg-background ${className}`} {...props}>
        <View className={`flex-1 px-2 ${safeAreaClasses} ${contentClassName}`}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View className={`flex-1 bg-background ${className}`} {...props}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-2"
        contentContainerClassName={`grow ${safeAreaClasses} ${contentClassName}`}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| HOW TO USE
|--------------------------------------------------------------------------
|
| // 1. Static screen (Login forms, dashboards) - scrolling disabled, keyboard handles inputs naturally
| <SafeScreen safeArea="both">
|   <LoginForm />
| </SafeScreen>
|
| // 2. Scrollable screen (Long forms, settings pages)
| <SafeScreen scrollable safeArea="top" contentClassName="gap-4">
|   {items.map(item => <ListItem key={item.id} />)}
| </SafeScreen>
|
*/
