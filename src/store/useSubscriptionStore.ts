import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

import {
  deleteSubscription as deleteSubscriptionInDb,
  insertSubscription,
  selectActiveSubscriptions,
} from "@/src/lib/ledger/subscription-repository";
import type { SubscriptionRow } from "@/src/lib/ledger/types";

type AddSubscriptionInput = {
  name: string;
  monthly_cost: number;
};

type SubscriptionStore = {
  subscriptions: SubscriptionRow[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addSubscription: (input: AddSubscriptionInput) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  refreshFromDb: () => Promise<void>;
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: [],
  isHydrated: false,

  hydrate: async () => {
    const subscriptions = await selectActiveSubscriptions();
    set({ subscriptions, isHydrated: true });
  },

  refreshFromDb: async () => {
    const subscriptions = await selectActiveSubscriptions();
    set({ subscriptions });
  },

  addSubscription: async (input) => {
    if (
      !input.name ||
      !Number.isSafeInteger(input.monthly_cost) ||
      input.monthly_cost <= 0
    ) {
      throw new Error(
        "Subscription name and positive integer cents are required",
      );
    }
    const now = Date.now();
    const row: SubscriptionRow = {
      id: uuidv4(),
      name: input.name,
      monthly_cost: input.monthly_cost,
      is_active: 1,
      created_at: now,
      updated_at: now,
    };
    await insertSubscription(row);
    set((state) => ({
      subscriptions: [...state.subscriptions, row].sort(
        (a, b) => a.created_at - b.created_at || a.id.localeCompare(b.id),
      ),
    }));
  },

  deleteSubscription: async (id) => {
    await deleteSubscriptionInDb(id);
    set((state) => ({
      subscriptions: state.subscriptions.filter((row) => row.id !== id),
    }));
  },
}));
