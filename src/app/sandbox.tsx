import { useFinance } from "@/src/components/hooks/useFinance";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { toCents } from "@/src/lib/ledger/money";
import { OpportunityCost } from "@/src/components/screens/sandbox/OpportunityCost";
import { SandboxInput } from "@/src/components/screens/sandbox/SandboxInput";
import { Button } from "heroui-native";
import { Icon } from "@/src/components/ui/icon";
import { ExpenseList } from "@/src/components/ui/expense-list";
import { Text } from "@/src/components/ui/text";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useLedgerStore } from "@/src/store/useLedgerStore";

type SandboxItem = {
  id: string;
  name: string;
  cost: number;
};

export default function SandboxScreen() {
  const router = useRouter();
  const { safeToSpend, totalBleed } = useFinance();
  const addTransaction = useLedgerStore((state) => state.addTransaction);

  const [cart, setCart] = useState<SandboxItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const totalCartCost = useMemo(
    () => cart.reduce((sum, item) => sum + item.cost, 0),
    [cart],
  );
  const remainingCapital = useMemo(
    () => safeToSpend - totalCartCost,
    [safeToSpend, totalCartCost],
  );
  const originalRunway = useMemo(
    () => (totalBleed > 0 ? safeToSpend / totalBleed : 0),
    [safeToSpend, totalBleed],
  );
  const newRunway = useMemo(
    () => (totalBleed > 0 ? remainingCapital / totalBleed : 0),
    [remainingCapital, totalBleed],
  );
  const runwayLostDays = useMemo(
    () => (originalRunway - newRunway) * 30,
    [originalRunway, newRunway],
  );
  const hustleRequired = useMemo(() => totalCartCost / 0.99, [totalCartCost]);

  const addToSandbox = () => {
    const cleanName = itemName.trim();
    const cost = toCents(itemCost);
    if (!cleanName || cost <= 0) return;

    const nextItem: SandboxItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: cleanName,
      cost,
    };

    setCart((prev) => [...prev, nextItem]);
    setItemName("");
    setItemCost("");
  };

  const removeFromSandbox = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const executeTrade = async () => {
    if (cart.length === 0 || isExecuting) return;

    setIsExecuting(true);
    try {
      await Promise.all(
        cart.map((item) =>
          addTransaction({
            type: "EXPENSE",
            amount: item.cost,
            status: "CLEARED",
            category: "Sandbox",
            note: item.name,
            taxRate: 100,
          }),
        ),
      );
      router.back();
    } catch (error) {
      console.error("Failed to execute sandbox trade:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderCartItem = ({ item }: { item: SandboxItem }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center py-4 border-b border-foreground/5"
      onLongPress={() => removeFromSandbox(item.id)}
      delayLongPress={300}
    >
      <View className="flex-1 mr-4">
        <Text numberOfLines={1}>{item.name}</Text>
      </View>
      <View className="items-end">
        <Text variant="large" className="text-red-500">
          -{formatCurrency(item.cost).replace("+ ", "")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen safeArea="both">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Button
          variant="tertiary"
          size="sm"
          isIconOnly
          onPress={() => router.back()}
          accessibilityLabel="Back to Runway"
        >
          <Icon name="chevron-back-sharp" size={20} color="white" />
        </Button>
      </View>

      {/* Impact Section: The Opportunity Cost */}
      <OpportunityCost
        runwayLostDays={runwayLostDays}
        hustleRequired={hustleRequired}
        remainingCapital={remainingCapital}
        safeToSpend={safeToSpend}
        totalCartCost={totalCartCost}
        formatCurrency={formatCurrency}
      />

      {/* Middle Section: The Regret List */}
      <ExpenseList
        data={cart}
        keyExtractor={(item) => item.id}
        title="The Regret List"
        badge={`${cart.length} ITEMS`}
        renderItem={renderCartItem}
      />

      {/* Input & Action */}
      <SandboxInput
        itemName={itemName}
        itemCost={itemCost}
        setItemName={setItemName}
        setItemCost={setItemCost}
        onAddToSandbox={addToSandbox}
        onExecuteTrade={executeTrade}
        isExecuting={isExecuting}
        cartLength={cart.length}
      />
    </SafeScreen>
  );
}
