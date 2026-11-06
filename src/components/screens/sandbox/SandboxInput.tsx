import { Button, Input, Label, TextField } from "heroui-native";
import React from "react";
import { View } from "react-native";

export interface SandboxInputProps {
  itemName: string;
  itemCost: string;
  setItemName: (value: string) => void;
  setItemCost: (value: string) => void;
  onAddToSandbox: () => void;
  onExecuteTrade: () => void;
  isExecuting: boolean;
  cartLength: number;
}

export function SandboxInput({
  itemName,
  itemCost,
  setItemName,
  setItemCost,
  onAddToSandbox,
  onExecuteTrade,
  isExecuting,
  cartLength,
}: SandboxInputProps): React.JSX.Element {
  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField>
            <Label>Item</Label>
            <Input
              placeholder="New headset"
              value={itemName}
              onChangeText={setItemName}
            />
          </TextField>
        </View>
        <View className="flex-1">
          <TextField>
            <Label>Cost </Label>
            <Input
              placeholder="499"
              value={itemCost}
              onChangeText={setItemCost}
              keyboardType="decimal-pad"
            />
          </TextField>
        </View>
      </View>

      <View className="flex flex-row gap-2">
        <View className="my-6">
          <Button
            className="h-14 rounded-xl items-center justify-center flex-row bg-plum-night w-full"
            feedbackVariant="scale"
            onPress={onAddToSandbox}
          >
            <Button.Label className="font-bold text-white">
              Add to Sandbox
            </Button.Label>
          </Button>
        </View>

        <View className="my-6">
          <Button
            className="h-14 rounded-xl items-center justify-center flex-row bg-plum-night"
            feedbackVariant="scale"
            onPress={onExecuteTrade}
            isDisabled={cartLength === 0 || isExecuting}
          >
            <Button.Label className="font-bold text-white">
              {isExecuting ? "Executing..." : "Execute Trade"}
            </Button.Label>
          </Button>
        </View>
      </View>
    </View>
  );
}
