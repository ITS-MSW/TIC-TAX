import "@/src/polyfills";
import "@/src/global.css";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Uniwind } from "uniwind";
import { useEffect } from "react";
import { initLedgerDatabase } from "@/src/lib/ledger/sqlite";
import { useLedgerStore } from "@/src/store/useLedgerStore";
import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useEffect(() => {
    Uniwind.setTheme("dark");
    void (async () => {
      await initLedgerDatabase();
      await useLedgerStore.getState().hydrate();
      await useSubscriptionStore.getState().hydrate();
    })();

    if (Platform.OS === "android") {
      NavigationBar.setStyle("dark");
      NavigationBar.setHidden(false);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView className="flex-1">
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <HeroUINativeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="sandbox"
                options={{ presentation: "modal", headerShown: false }}
              />
            </Stack>
            <StatusBar style="light" />
          </HeroUINativeProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
