import { formatCurrency } from "@/src/components/lib/format-currency";
import { TimelineItem } from "@/src/components/ui/Timeline";
import { Text } from "@/src/components/ui/text";
import { Card } from "heroui-native";
import { FlatList, TouchableOpacity, View } from "react-native";
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
        renderItem={({ item: tx, index }) => {
          const icon = getTransactionIcon(tx);
          return (
            <TouchableOpacity
              onLongPress={() => onTransactionLongPress(tx)}
              delayLongPress={300}
            >
              <TimelineItem
                icon={icon.name}
                iconColor={icon.color}
                iconBgColor="bg-plum-deep"
                title={tx.note || tx.category}
                subtitle={tx.note ? tx.category : undefined}
                isFirst={index === 0}
                isLast={index === transactions.length - 1}
                rightContent={
                  <Text variant="xs" className={getTransactionTone(tx)}>
                    {formatCurrency(getTransactionAmount(tx))}
                  </Text>
                }
              />
            </TouchableOpacity>
          );
        }}
      />
    </Card>
  );
}
