import { CATEGORIES } from "@/src/components/screens/home/constants";
import { RenderIf } from "@/src/components/helpers/render-if";
import { Show } from "@/src/components/helpers/show";
import { toCents } from "@/src/lib/ledger/money";
import { useLedgerStore } from "@/src/store/useLedgerStore";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import {
  BottomSheet,
  Button,
  Chip,
  Label,
  Tabs,
  TextField,
  cn,
} from "heroui-native";
import React, { useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledBottomSheetTextInput = withUniwind(BottomSheetTextInput);

interface TransactionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionSheet({
  isOpen,
  onOpenChange,
}: TransactionSheetProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("OUT");
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("Junk");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTransaction = useLedgerStore((state) => state.addTransaction);

  const handleSubmit = async () => {
    const amountCents = toCents(amount);
    if (__DEV__) {
      console.log("[tx-sheet] submit:start", {
        rawAmount: amount,
        parsedCents: amountCents,
        type,
        isPending,
        category,
        noteLength: note.trim().length,
      });
    }

    if (amountCents <= 0) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        amount: amountCents,
        type: type === "IN" ? "INCOME" : "EXPENSE",
        status: type === "IN" && isPending ? "PENDING" : "CLEARED",
        category: type === "IN" ? "Income" : category,
        note: note.trim() || undefined,
        taxRate: 100,
      });
      if (__DEV__) {
        console.log("[tx-sheet] submit:success");
      }
      setAmount("");
      setNote("");
      setIsPending(false);
      onOpenChange(false);
    } catch (error) {
      if (__DEV__) {
        console.error("[tx-sheet] submit:error", error);
      }
      console.error("Failed to log transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay className="bg-black/60" />
        <BottomSheet.Content
          index={0}
          snapPoints={["88%"]}
          enableDynamicSizing={false}
          enablePanDownToClose
          backgroundClassName="bg-background rounded-t-[40px] border-t border-white/5"
        >
          <View className="gap-8 pb-safe">
            <View className="items-center">
              <BottomSheet.Title className="text-xl font-semibold leading-7 text-foreground">
                New Transaction
              </BottomSheet.Title>
            </View>

            {/* IN/OUT Toggle */}
            <Tabs
              value={type}
              onValueChange={(value) => {
                const nextType = value as "IN" | "OUT";
                setType(nextType);
                if (nextType === "OUT") {
                  setIsPending(false);
                }
              }}
              variant="secondary"
            >
              <Tabs.List className="rounded-xl">
                <Tabs.Indicator className="rounded-xl" />
                <Tabs.Trigger value="IN" className="rounded-xl flex-1">
                  {({ isSelected }) => (
                    <Tabs.Label
                      className={cn(
                        "font-bold",
                        isSelected ? "text-white" : "text-foreground/40",
                      )}
                    >
                      Income
                    </Tabs.Label>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="OUT" className="rounded-xl flex-1">
                  {({ isSelected }) => (
                    <Tabs.Label
                      className={cn(
                        "font-bold",
                        isSelected ? "text-white" : "text-foreground/40",
                      )}
                    >
                      Expense
                    </Tabs.Label>
                  )}
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs>

            <RenderIf condition={type === "IN"}>
              <View className="gap-3">
                <Label>Income Mode</Label>
                <Tabs
                  value={isPending ? "PENDING" : "CLEARED"}
                  onValueChange={(value) => setIsPending(value === "PENDING")}
                  variant="secondary"
                >
                  <Tabs.List className="rounded-xl">
                    <Tabs.Indicator className="rounded-xl" />
                    <Tabs.Trigger value="CLEARED" className="rounded-xl flex-1">
                      {({ isSelected }) => (
                        <Tabs.Label
                          className={cn(
                            "font-semibold",
                            isSelected ? "text-white" : "text-foreground/50",
                          )}
                        >
                          Cash Received
                        </Tabs.Label>
                      )}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="PENDING" className="rounded-xl flex-1">
                      {({ isSelected }) => (
                        <Tabs.Label
                          className={cn(
                            "font-semibold",
                            isSelected ? "text-white" : "text-foreground/50",
                          )}
                        >
                          Invoice Sent
                        </Tabs.Label>
                      )}
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs>
              </View>
            </RenderIf>

            {/* Amount Input */}
            <TextField>
              <Label>Amount</Label>
              <StyledBottomSheetTextInput
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                selectionColorClassName="accent-foreground"
                placeholderTextColorClassName="accent-field-placeholder"
                className="min-h-[48px] rounded-[12px] border border-field-border bg-field px-[14px] py-[12px] text-[16px] text-foreground"
              />
            </TextField>

            {/* Note Input */}
            <TextField>
              <Label>Note</Label>
              <StyledBottomSheetTextInput
                placeholder="Optional note (Client, reason, etc.)"
                value={note}
                onChangeText={setNote}
                selectionColorClassName="accent-foreground"
                placeholderTextColorClassName="accent-field-placeholder"
                className="min-h-[48px] rounded-[12px] border border-field-border bg-field px-[14px] py-[12px] text-[16px] text-foreground"
              />
            </TextField>

            {/* Category Chips (only for OUT) */}
            <RenderIf condition={type === "OUT"}>
              <View className="gap-3">
                <Label>Category</Label>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Chip
                      key={cat}
                      onPress={() => setCategory(cat)}
                      variant="primary"
                    >
                      <Chip.Label
                        className={cn(
                          "font-bold",
                          category === cat
                            ? "text-white"
                            : "text-foreground/60",
                        )}
                      >
                        {cat}
                      </Chip.Label>
                    </Chip>
                  ))}
                </View>
              </View>
            </RenderIf>

            {/* Submit Button */}
            <Button
              variant="primary"
              onPress={handleSubmit}
              isDisabled={!amount || isSubmitting}
            >
              <Show>
                <Show.When condition={isSubmitting}>
                  <Button.Label>Logging...</Button.Label>
                </Show.When>
                <Show.Else>
                  <>
                    <Button.Label>Confirm</Button.Label>
                  </>
                </Show.Else>
              </Show>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
