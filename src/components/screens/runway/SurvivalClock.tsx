import { Flame, Skull } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/src/components/ui/text";
import { Card } from "heroui-native";

export interface SurvivalClockProps {
  runwayMonths: number;
  monthlyBurn: number;
  safeToSpend: number;
  financeLoading: boolean;
  isCritical: boolean;
  formatRunway: (months: number) => string;
  formatCurrency: (amount: number) => string;
}

export function SurvivalClock({
  runwayMonths,
  monthlyBurn,
  safeToSpend,
  financeLoading,
  isCritical,
  formatRunway,
  formatCurrency,
}: SurvivalClockProps) {
  return (
    <View className="items-center gap-2">
      <View className="flex-row items-center gap-2">
        {isCritical ? (
          <Skull size={18} color="#ef4444" />
        ) : (
          <Flame size={18} color="#22c55e" />
        )}
        <Text
          className={
            isCritical
              ? "text-red-500 tracking-widest"
              : "text-green-500 tracking-widest"
          }
        >
          The Survival Clock
        </Text>
      </View>

      <View className="items-center">
        <Text
          className={`text-8xl tracking-tighter ${isCritical ? "text-red-500" : "text-foreground"}`}
        >
          {formatRunway(runwayMonths)}
        </Text>
      </View>

      <Card className="bg-accent rounded-xl px-8 py-4 flex-row items-center gap-6 border">
        <View>
          <Text variant="small">Monthly Burn</Text>
          <Text variant="large" className="text-foreground">
            {formatCurrency(monthlyBurn).replace("+ ", "")}
          </Text>
        </View>
        <View className="w-px h-10 bg-white" />
        <View>
          <Text variant="small">Safe Capital</Text>
          <Text variant="large" className="text-foreground">
            {financeLoading
              ? "..."
              : formatCurrency(safeToSpend).replace("+ ", "")}
          </Text>
        </View>
      </Card>
    </View>
  );
}
