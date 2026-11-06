import { getLedgerDatabase, initLedgerDatabase } from "@/src/lib/ledger/sqlite";
import type { LedgerTransactionRow } from "@/src/lib/ledger/types";

function mapRow(row: Record<string, unknown>): LedgerTransactionRow {
  return {
    id: String(row.id),
    type: row.type as LedgerTransactionRow["type"],
    amount: Number(row.amount),
    status: row.status as LedgerTransactionRow["status"],
    category: row.category ? String(row.category) : null,
    note: row.note ? String(row.note) : null,
    tax_rate: Number(row.tax_rate),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

export async function selectAllTransactions(): Promise<LedgerTransactionRow[]> {
  await initLedgerDatabase();
  const db = getLedgerDatabase();
  const { results } = await db.executeAsync(
    "SELECT * FROM transactions ORDER BY created_at DESC",
  );
  return results.map(mapRow);
}

export async function insertTransaction(
  row: LedgerTransactionRow,
): Promise<void> {
  await initLedgerDatabase();
  const db = getLedgerDatabase();
  if (__DEV__) {
    console.log("[ledger-repo] insert:start", {
      id: row.id,
      amount: row.amount,
      type: row.type,
      status: row.status,
    });
  }
  await db.executeAsync(
    `INSERT INTO transactions (
      id, type, amount, status, category, note, tax_rate, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.type,
      row.amount,
      row.status,
      row.category,
      row.note,
      row.tax_rate,
      row.created_at,
      row.updated_at,
    ],
  );
  if (__DEV__) {
    console.log("[ledger-repo] insert:ok", { id: row.id });
  }
}

export async function updateTransactionStatus(
  id: string,
  status: LedgerTransactionRow["status"],
  updatedAt: number,
): Promise<void> {
  await initLedgerDatabase();
  const db = getLedgerDatabase();
  await db.executeAsync(
    `UPDATE transactions
     SET status = ?, updated_at = ?
     WHERE id = ?`,
    [status, updatedAt, id],
  );
}
