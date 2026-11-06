export type LedgerTransactionType =
  | "INCOME"
  | "EXPENSE"
  | "TAX_PAYMENT"
  | "SUBSCRIPTION";

export type LedgerTransactionStatus =
  | "PENDING"
  | "CLEARED"
  | "ACTIVE"
  | "CANCELLED";

export type LedgerTransactionRow = {
  id: string;
  type: LedgerTransactionType;
  amount: number;
  status: LedgerTransactionStatus;
  category: string | null;
  note: string | null;
  tax_rate: number;
  created_at: number;
  updated_at: number;
};

export type SubscriptionRow = {
  id: string;
  name: string;
  monthly_cost: number;
  is_active: number;
  created_at: number;
  updated_at: number;
};
