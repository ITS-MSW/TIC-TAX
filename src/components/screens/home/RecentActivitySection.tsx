import { formatCurrency } from "@/src/components/lib/format-currency";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { Card, ListGroup } from "heroui-native";
import { FlatList, View } from "react-native";
import { CATEGORY_ICONS } from "./constants";

type TransactionType = "IN" | "OUT";
type TransactionStatus = "PENDING" | "CLEARED";

export interface RecentActivityTransaction {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  type: TransactionType;
  status?: TransactionStatus;
}

export interface RecentActivitySectionProps<
  T extends RecentActivityTransaction = RecentActivityTransaction,
> {
  transactions: T[];
  isLoading: boolean;
  onTransactionLongPress: (tx: T) => void;
}

function getTransactionIcon(tx: RecentActivityTransaction) {
  const name =
    CATEGORY_ICONS[tx.category as keyof typeof CATEGORY_ICONS] ?? "help-circle";

  if (tx.type === "IN" && tx.status === "PENDING") {
    return { name, color: "#fbbf24" };
  }
  if (tx.type === "IN") {
    return { name, color: "#22c55e" };
  }
  return { name, color: "#ef4444" };
}

function getTransactionTone(tx: RecentActivityTransaction) {
  if (tx.type !== "IN") return "text-white/40";
  if (tx.status === "PENDING") return "text-yellow-400";
  return "text-emerald-400";
}

function getTransactionAmount(tx: RecentActivityTransaction) {
  return tx.type === "IN" ? tx.amount : -tx.amount;
}

export function RecentActivitySection<T extends RecentActivityTransaction>({
  transactions,
  isLoading,
  onTransactionLongPress,
}: RecentActivitySectionProps<T>) {
  return (
    <Card variant="transparent" className="flex-1 py-4 px-2">
      <Text variant="large" className="mb-4">
        Recent Activity
      </Text>
      <ListGroup variant="transparent" className="flex-1">
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !isLoading ? (
              <View className="py-20 items-center">
                <Text variant="small" className="text-white/20">
                  No Items Yet
                </Text>
              </View>
            ) : undefined
          }
          renderItem={({ item: tx }) => {
            const icon = getTransactionIcon(tx);
            return (
              <ListGroup.Item
                className="px-0 py-2 gap-3"
                onLongPress={() => onTransactionLongPress(tx)}
                delayLongPress={300}
              >
                <ListGroup.ItemPrefix className="size-8 items-center justify-center shrink-0">
                  <Icon name={icon.name} size={18} color={icon.color} />
                </ListGroup.ItemPrefix>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle className="text-sm leading-5 font-bold text-foreground">
                    {tx.note || tx.category}
                  </ListGroup.ItemTitle>
                  {tx.note && tx.category ? (
                    <ListGroup.ItemDescription className="text-sm leading-5 font-medium text-foreground/80">
                      {tx.category}
                    </ListGroup.ItemDescription>
                  ) : null}
                </ListGroup.ItemContent>
                <ListGroup.ItemSuffix>
                  <Text variant="xs" className={getTransactionTone(tx)}>
                    {formatCurrency(getTransactionAmount(tx))}
                  </Text>
                </ListGroup.ItemSuffix>
              </ListGroup.Item>
            );
          }}
        />
      </ListGroup>
    </Card>
  );
}
