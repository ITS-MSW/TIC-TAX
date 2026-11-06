import { getLedgerDatabase, initLedgerDatabase } from "@/src/lib/ledger/sqlite";
import type { SubscriptionRow } from "@/src/lib/ledger/types";

function mapRow(row: Record<string, unknown>): SubscriptionRow {
  return {
    id: String(row.id),
    name: String(row.name),
    monthly_cost: Number(row.monthly_cost),
    is_active: Number(row.is_active),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function selectActiveSubscriptions(): Promise<SubscriptionRow[]> {
  await initLedgerDatabase();
  const { results } = await getLedgerDatabase().executeAsync(
    "SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY created_at ASC, id ASC",
  );
  return results.map(mapRow);
}

export async function insertSubscription(row: SubscriptionRow): Promise<void> {
  await initLedgerDatabase();
  await getLedgerDatabase().executeAsync(
    `INSERT INTO subscriptions (
      id, name, monthly_cost, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.name,
      row.monthly_cost,
      row.is_active,
      row.created_at,
      row.updated_at,
    ],
  );
}

export async function deleteSubscription(id: string): Promise<void> {
  await initLedgerDatabase();
  await getLedgerDatabase().executeAsync(
    "DELETE FROM subscriptions WHERE id = ?",
    [id],
  );
}
