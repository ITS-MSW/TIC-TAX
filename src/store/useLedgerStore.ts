import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

import {
  insertTransaction,
  selectAllTransactions,
  updateTransactionStatus as updateTransactionStatusInDb,
} from "@/src/lib/ledger/repository";
import type { LedgerTransactionRow } from "@/src/lib/ledger/types";

type AddLedgerTransactionInput = {
  type: LedgerTransactionRow["type"];
  amount: number;
  status: LedgerTransactionRow["status"];
  category?: string;
  note?: string;
  taxRate?: number;
};

type LedgerStore = {
  transactions: LedgerTransactionRow[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addTransaction: (input: AddLedgerTransactionInput) => Promise<void>;
  cancelTransaction: (id: string) => Promise<void>;
  clearIncome: (id: string) => Promise<void>;
  markTaxesPaid: () => Promise<void>;
  refreshFromDb: () => Promise<void>;
};

function sortDesc(rows: LedgerTransactionRow[]): LedgerTransactionRow[] {
  return [...rows].sort((a, b) => b.created_at - a.created_at);
}

function buildLedgerTransaction(
  input: AddLedgerTransactionInput,
  now: number,
): LedgerTransactionRow {
  return {
    id: uuidv4(),
    type: input.type,
    amount: input.amount,
    status: input.status,
    category: input.category ?? null,
    note: input.note ?? null,
    tax_rate: input.taxRate ?? 100,
    created_at: now,
    updated_at: now,
  };
}

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  transactions: [],
  isHydrated: false,

  hydrate: async () => {
    const startedAt = Date.now();
    const rows = await selectAllTransactions();
    set({ transactions: rows, isHydrated: true });

    const elapsed = Date.now() - startedAt;
    if (__DEV__ && elapsed > 100) {
      console.warn(`Ledger hydration took ${elapsed}ms (target < 100ms)`);
    }
  },

  refreshFromDb: async () => {
    const rows = await selectAllTransactions();
    set({ transactions: rows });
  },

  addTransaction: async (input) => {
    const now = Date.now();
    const row = buildLedgerTransaction(input, now);

    if (__DEV__) {
      console.log("[ledger-store] addTransaction:start", {
        id: row.id,
        type: row.type,
        amount: row.amount,
        status: row.status,
        category: row.category,
        hasNote: !!row.note,
      });
    }

    set((state) => ({
      transactions: sortDesc([...state.transactions, row]),
    }));

    if (__DEV__) {
      console.log("[ledger-store] addTransaction:stateUpdated", { id: row.id });
    }

    try {
      await insertTransaction(row);
    } catch (error) {
      if (__DEV__) {
        console.error("[ledger-store] addTransaction:persistError", error);
      }

      set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== row.id),
      }));
      throw error;
    }

    if (__DEV__) {
      console.log("[ledger-store] addTransaction:inserted", { id: row.id });
    }
  },

  cancelTransaction: async (id) => {
    const now = Date.now();
    await updateTransactionStatusInDb(id, "CANCELLED", now);

    set((state) => ({
      transactions: state.transactions.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "CANCELLED",
              updated_at: now,
            }
          : row,
      ),
    }));
  },

  clearIncome: async (id) => {
    const now = Date.now();
    await updateTransactionStatusInDb(id, "CLEARED", now);

    set((state) => ({
      transactions: state.transactions.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "CLEARED",
              updated_at: now,
            }
          : row,
      ),
    }));
  },

  markTaxesPaid: async () => {
    const activeRows = get().transactions.filter(
      (row) => row.status !== "CANCELLED",
    );
    const taxHostage = activeRows.reduce((sum, row) => {
      if (row.type !== "INCOME" || row.status !== "CLEARED") {
        return sum;
      }

      return sum + Math.trunc((row.amount * row.tax_rate) / 10000);
    }, 0);

    if (taxHostage <= 0) {
      return;
    }

    const now = Date.now();
    const paymentRow = buildLedgerTransaction(
      {
        type: "TAX_PAYMENT",
        amount: taxHostage,
        status: "CLEARED",
        category: "Tax Payment",
        note: undefined,
        taxRate: 100,
      },
      now,
    );

    await insertTransaction(paymentRow);

    set((state) => ({
      transactions: sortDesc([...state.transactions, paymentRow]),
    }));
  },
}));
