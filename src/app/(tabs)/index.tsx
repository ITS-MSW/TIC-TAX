import { TransactionSheet } from "@/src/components/finance/TransactionSheet";
import { useFinance } from "@/src/components/hooks/useFinance";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { ClearInvoiceDialog } from "@/src/components/screens/home/ClearInvoiceDialog";
import { DeleteTransactionDialog } from "@/src/components/screens/home/DeleteTransactionDialog";
import { FinanceSummary } from "@/src/components/screens/home/FinanceSummary";
import { PayTaxesDialog } from "@/src/components/screens/home/PayTaxesDialog";
import { RecentActivitySection } from "@/src/components/screens/home/RecentActivitySection";
import { PlumGradientBackground } from "@/src/components/ui/PlumGradientBackground";
import { useLedgerStore } from "@/src/store/useLedgerStore";
import { useState } from "react";
import { Button } from "heroui-native";
import { View } from "react-native";

export default function PulseTab() {
  const {
    safeToSpend,
    taxHostage,
    pendingCapital,
    recentTransactions,
    isLoading,
  } = useFinance();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingClearId, setPendingClearId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isTaxesDialogOpen, setIsTaxesDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearingInvoice, setIsClearingInvoice] = useState(false);
  const [isPayingTaxes, setIsPayingTaxes] = useState(false);
  const cancelTransaction = useLedgerStore((state) => state.cancelTransaction);
  const clearIncome = useLedgerStore((state) => state.clearIncome);
  const markTaxesPaid = useLedgerStore((state) => state.markTaxesPaid);
  type RecentTransaction = (typeof recentTransactions)[number];

  const openDeleteDialog = (id: string) => {
    setPendingDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setPendingDeleteId(null);
  };

  const openClearDialog = (id: string) => {
    setPendingClearId(id);
    setIsClearDialogOpen(true);
  };

  const handleClearDialogChange = (open: boolean) => {
    setIsClearDialogOpen(open);
    if (!open) setPendingClearId(null);
  };

  const handleTransactionLongPress = (tx: RecentTransaction) => {
    if (tx.type === "IN" && tx.status === "PENDING") {
      openClearDialog(tx._id);
      return;
    }

    openDeleteDialog(tx._id);
  };

  const confirmDeleteTransaction = async () => {
    if (!pendingDeleteId || isDeleting) return;

    setIsDeleting(true);
    try {
      await cancelTransaction(pendingDeleteId);
      setIsDeleteDialogOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmClearInvoice = async () => {
    if (!pendingClearId || isClearingInvoice) return;

    setIsClearingInvoice(true);
    try {
      await clearIncome(pendingClearId);
      setIsClearDialogOpen(false);
      setPendingClearId(null);
    } catch (error) {
      console.error("Failed to clear invoice:", error);
    } finally {
      setIsClearingInvoice(false);
    }
  };

  const confirmMarkTaxesPaid = async () => {
    if (isPayingTaxes) return;

    setIsPayingTaxes(true);
    try {
      await markTaxesPaid();
      setIsTaxesDialogOpen(false);
    } catch (error) {
      console.error("Failed to mark taxes paid:", error);
    } finally {
      setIsPayingTaxes(false);
    }
  };

  return (
    <SafeScreen
      safeArea="both"
      className="relative overflow-hidden bg-transparent"
    >
      <PlumGradientBackground />

      {/* Finance Summary */}
      <FinanceSummary
        safeToSpend={safeToSpend}
        taxHostage={taxHostage}
        pendingCapital={pendingCapital}
        isLoading={isLoading}
        onTaxHostageLongPress={() => setIsTaxesDialogOpen(true)}
      />

      <RecentActivitySection
        transactions={recentTransactions}
        isLoading={isLoading}
        onTransactionLongPress={handleTransactionLongPress}
      />

      <View className="my-6">
        <Button
          className="h-14 rounded-xl items-center justify-center flex-row bg-plum-deep"
          feedbackVariant="scale"
          onPress={() => setIsSheetOpen(true)}
        >
          <Button.Label className="font-bold text-foreground">
            New Transaction
          </Button.Label>
        </Button>
      </View>
      <TransactionSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={confirmDeleteTransaction}
        isLoading={isDeleting}
      />

      <ClearInvoiceDialog
        isOpen={isClearDialogOpen}
        onOpenChange={handleClearDialogChange}
        onConfirm={confirmClearInvoice}
        isLoading={isClearingInvoice}
      />

      <PayTaxesDialog
        isOpen={isTaxesDialogOpen}
        onOpenChange={setIsTaxesDialogOpen}
        onConfirm={confirmMarkTaxesPaid}
        isLoading={isPayingTaxes}
      />
    </SafeScreen>
  );
}
