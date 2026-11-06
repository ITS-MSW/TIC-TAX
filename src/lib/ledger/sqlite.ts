import { open } from "react-native-nitro-sqlite";

// Match Expo SQLite's existing Documents/SQLite (iOS) and files/SQLite (Android).
const db = open({ name: "tic-tax-ledger.db", location: "SQLite" });
const SCHEMA_VERSION = 1;
const CREATE_TRANSACTIONS_SQL = `CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT CHECK(type IN ('INCOME', 'EXPENSE', 'TAX_PAYMENT', 'SUBSCRIPTION')),
  amount INTEGER,
  status TEXT CHECK(status IN ('PENDING', 'CLEARED', 'ACTIVE', 'CANCELLED')),
  category TEXT,
  note TEXT,
  tax_rate INTEGER DEFAULT 100,
  created_at INTEGER,
  updated_at INTEGER
)`;
let initialization: Promise<void> | undefined;

async function migrateLedgerDatabase(): Promise<void> {
  await db.transaction(async (tx) => {
    const { results: versions } = await tx.executeAsync("PRAGMA user_version");
    const version = Number(versions[0]?.user_version ?? 0);
    if (version > SCHEMA_VERSION) {
      throw new Error(`Unsupported ledger schema version: ${version}`);
    }
    if (version === SCHEMA_VERSION) return;

    const { results: columns } = await tx.executeAsync(
      "PRAGMA table_info(transactions)",
    );
    if (columns.length > 0) {
      const names = new Set(columns.map((column) => String(column.name)));
      // Older local ledgers predate category/note; preserve those rows too.
      const category = names.has("category") ? "category" : "NULL";
      const note = names.has("note") ? "note" : "NULL";
      await tx.executeAsync(
        "ALTER TABLE transactions RENAME TO transactions_legacy",
      );
      await tx.executeAsync(CREATE_TRANSACTIONS_SQL);
      await tx.executeAsync(`INSERT INTO transactions (
        id, type, amount, status, category, note, tax_rate, created_at, updated_at
      ) SELECT id, type, amount, status, ${category}, ${note}, tax_rate, created_at, updated_at
        FROM transactions_legacy`);
      await tx.executeAsync("DROP TABLE transactions_legacy");
    } else {
      await tx.executeAsync(CREATE_TRANSACTIONS_SQL);
    }
    await tx.executeAsync(
      "CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC)",
    );
    await tx.executeAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

export function initLedgerDatabase(): Promise<void> {
  initialization ??= migrateLedgerDatabase().catch((error: unknown) => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}

export function getLedgerDatabase() {
  return db;
}
