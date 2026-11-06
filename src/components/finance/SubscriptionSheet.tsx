import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheet, Button, Label, TextField } from "heroui-native";
import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";
import { toCents } from "@/src/lib/ledger/money";
import { Text } from "@/src/components/ui/text";

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
              <Text variant="large">New SaaS Bleed</Text>
            </View>

            {/* Name Input */}
            <TextField>
              <Label>Service Name</Label>
              <BottomSheetTextInput
                placeholder="e.g. ChatGPT"
                value={name}
                onChangeText={setName}
                selectionColor="#f8fafc"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </TextField>

            {/* Monthly Cost Input */}
            <TextField>
              <Label>Monthly Cost (MAD)</Label>
              <BottomSheetTextInput
                placeholder="0.00"
                value={monthlyCost}
                onChangeText={setMonthlyCost}
                keyboardType="decimal-pad"
                selectionColor="#f8fafc"
                placeholderTextColor="#94a3b8"
                style={styles.input}
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

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 12,
  },
});
