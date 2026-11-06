import { SubscriptionSheet } from "@/src/components/finance/SubscriptionSheet";
import { useFinance } from "@/src/components/hooks/useFinance";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { formatCurrency } from "@/src/components/lib/format-currency";
import { formatRunway } from "@/src/components/lib/format-runway";
import { DeleteSubscriptionDialog } from "@/src/components/screens/runway/DeleteSubscriptionDialog";
import { SurvivalClock } from "@/src/components/screens/runway/SurvivalClock";
import { ExpenseList } from "@/src/components/ui/expense-list";
import { Icon } from "@/src/components/ui/icon";
import { PlumGradientBackground } from "@/src/components/ui/PlumGradientBackground";
import { Text } from "@/src/components/ui/text";
import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";
import { centsToAmount } from "@/src/lib/ledger/money";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Calculator } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function RunwayScreen() {
  const router = useRouter();
  const { safeToSpend, isLoading: financeLoading } = useFinance();
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const subscriptionsHydrated = useSubscriptionStore(
    (state) => state.isHydrated,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<
    (typeof subscriptions)[number]["id"] | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteSubscription = useSubscriptionStore(
    (state) => state.deleteSubscription,
  );

  const openDeleteDialog = (id: (typeof subscriptions)[number]["id"]) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setPendingDeleteId(null);
  };

  const confirmDeleteSubscription = async () => {
    if (!pendingDeleteId || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteSubscription(pendingDeleteId);
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error("Failed to delete subscription:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const monthlyBurn = useMemo(() => {
    return centsToAmount(
      subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0),
    );
  }, [subscriptions]);

  const runwayMonths = useMemo(() => {
    if (monthlyBurn === 0) return Number.POSITIVE_INFINITY;
    return safeToSpend / monthlyBurn;
  }, [safeToSpend, monthlyBurn]);

  const isCritical = runwayMonths < 2;

  const renderSubscription = ({
    item,
  }: {
    item: (typeof subscriptions)[0];
  }) => (
    <TouchableOpacity
      className="flex-row justify-between items-center py-2 border-b border-white/5"
      onLongPress={() => openDeleteDialog(item.id)}
      delayLongPress={300}
    >
      <View className="size-8 items-center justify-center shrink-0">
        <Icon name="arrow-up-outline" size={18} color="red" />
      </View>
      <View className="flex-1 mr-8">
        <Text numberOfLines={1}>{item.name}</Text>
      </View>
      <View className="items-end">
        <Text variant="xs">
          {formatCurrency(centsToAmount(item.monthly_cost)).replace("+ ", "")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeScreen safeArea="both">
      <View className="flex-row justify-end">
        <Button
          variant="ghost"
          isIconOnly
          feedbackVariant="scale"
          className="z-99"
          onPress={() => router.push("/sandbox")}
          accessibilityLabel="Open opportunity cost sandbox"
        >
          <Calculator size={18} color="white" />
        </Button>
      </View>

      <PlumGradientBackground />

      {/* Survival Clock */}
      <SurvivalClock
        runwayMonths={runwayMonths}
        monthlyBurn={monthlyBurn}
        safeToSpend={safeToSpend}
        financeLoading={financeLoading}
        isCritical={isCritical}
        formatRunway={formatRunway}
        formatCurrency={formatCurrency}
      />

      {/* Middle Section: The SaaS Bleed */}

      <ExpenseList
        data={subscriptions}
        isLoading={!subscriptionsHydrated}
        keyExtractor={(item) => item.id}
        title="Continuous Bleed"
        badge={`${subscriptions.length} ACTIVE`}
        renderItem={renderSubscription}
      />

      {/* Bottom Section: Action */}
      <View className="my-6">
        <Button
          className="h-14 rounded-xl items-center justify-center flex-row bg-plum-deep"
          feedbackVariant="scale"
          onPress={() => setIsSheetOpen(true)}
        >
          <Button.Label className="font-bold text-foreground">
            New Bleeding
          </Button.Label>
        </Button>
      </View>

      <SubscriptionSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <DeleteSubscriptionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={confirmDeleteSubscription}
        isLoading={isDeleting}
      />
    </SafeScreen>
  );
}
