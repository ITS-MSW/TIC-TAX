import React, { useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheet, Button, Label, TextField } from "heroui-native";
import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";
import { toCents } from "@/src/lib/ledger/money";

const StyledBottomSheetTextInput = withUniwind(BottomSheetTextInput);

interface SubscriptionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionSheet({
  isOpen,
  onOpenChange,
}: SubscriptionSheetProps) {
  const [name, setName] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription,
  );

  const handleSubmit = async () => {
    const cost = toCents(monthlyCost);
    if (isSubmitting || !name || !Number.isSafeInteger(cost) || cost <= 0)
      return;

    setIsSubmitting(true);
    try {
      await addSubscription({
        name,
        monthly_cost: cost,
      });
      setName("");
      setMonthlyCost("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add subscription:", error);
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
          snapPoints={["62%"]}
          enableDynamicSizing={false}
          enablePanDownToClose
          backgroundClassName="bg-background"
        >
          <View className="gap-8 pb-safe">
            <View className="items-center">
              <BottomSheet.Title className="text-xl font-semibold leading-7 text-foreground">
                New SaaS Bleed
              </BottomSheet.Title>
            </View>

            {/* Name Input */}
            <TextField>
              <Label>Service Name</Label>
              <StyledBottomSheetTextInput
                placeholder="e.g. ChatGPT"
                value={name}
                onChangeText={setName}
                selectionColorClassName="accent-foreground"
                placeholderTextColorClassName="accent-field-placeholder"
                className="min-h-[48px] rounded-[12px] border border-field-border bg-field px-[14px] py-[12px] text-[16px] text-foreground"
              />
            </TextField>

            {/* Monthly Cost Input */}
            <TextField>
              <Label>Monthly Cost (MAD)</Label>
              <StyledBottomSheetTextInput
                placeholder="0.00"
                value={monthlyCost}
                onChangeText={setMonthlyCost}
                keyboardType="decimal-pad"
                selectionColorClassName="accent-foreground"
                placeholderTextColorClassName="accent-field-placeholder"
                className="min-h-[48px] rounded-[12px] border border-field-border bg-field px-[14px] py-[12px] text-[16px] text-foreground"
              />
            </TextField>

            {/* Submit Button */}
            <Button
              variant="primary"
              onPress={handleSubmit}
              isDisabled={!name || !monthlyCost || isSubmitting}
            >
              {isSubmitting ? (
                <Button.Label>Adding...</Button.Label>
              ) : (
                <>
                  <Button.Label>Add Subscription</Button.Label>
                </>
              )}
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
