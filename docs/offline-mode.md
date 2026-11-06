# Local SQLite storage

Transactions and subscriptions persist only on the device through `react-native-nitro-sqlite` and Nitro Modules. There is no remote sync, account scope, connectivity listener, or pull cursor.

## Native runtime and database path

A native development build is required; Expo Go does not include these native modules. Build with `bun run ios` or `bun run android`. Web persistence is outside the mobile-only scope. No backend environment variables are needed.

The connection opens `tic-tax-ledger.db` with `location: "SQLite"`:

- iOS: `<Documents>/SQLite/tic-tax-ledger.db`
- Android: `<files>/SQLite/tic-tax-ledger.db`

Keep this location when changing the driver or connection setup so existing installations retain their data. Local-only storage does not provide a cloud backup. Existing hosted subscriptions are not automatically imported into the local database.

## Schema and migrations

`src/lib/ledger/sqlite.ts` uses `PRAGMA user_version` inside a transaction. Initialization completes before repository reads and writes; a failed migration rolls back and prevents hydration.

- Version 1 rebuilds legacy transactions without sync metadata, preserving IDs, integer cents, status, category, note, tax rate and timestamps. It creates a descending `created_at` index.
- Version 2 adds `subscriptions` and an active/created_at index without rebuilding version 1 transactions.
- Current-version startup skips schema changes. A newer unsupported version is rejected instead of modified.

Transactions contain `id`, `type`, `amount`, `status`, `category`, `note`, `tax_rate`, `created_at` and `updated_at`. Cancellation sets status to `CANCELLED`; historical rows remain stored.

Subscriptions contain `id`, `name`, `monthly_cost`, `is_active`, `created_at` and `updated_at`. The list reads active rows; confirming deletion removes the selected local subscription.

Money is stored as integer cents (`amount`, `monthly_cost`). Inputs use `toCents`; displays use `centsToAmount`. UUID v4 identifiers are generated once at creation.

## Boot and writes

1. Initialize/migrate the database.
2. Hydrate the transaction store.
3. Hydrate the subscription store.

Transaction insertion updates Zustand optimistically, then awaits SQLite. A failed insert removes the optimistic row and propagates the error. Cancellation and income clearing update SQLite before updating local state. Tax payments append a local transaction.

Subscription additions and deletions await SQLite before updating Zustand. Runway sums active subscription costs in cents, then converts the total for the existing monthly burn and runway calculations.

## Owners

- `src/lib/ledger/sqlite.ts`: shared connection, schema versions and initialization.
- `src/lib/ledger/repository.ts`: transaction queries and writes.
- `src/lib/ledger/subscription-repository.ts`: active subscriptions, inserts and deletion.
- `src/store/useLedgerStore.ts`: transaction state and finance actions.
- `src/store/useSubscriptionStore.ts`: subscription state and hydration.
- `src/components/hooks/useFinance.ts`: local transaction read model.

## Verification

On a native development build, confirm existing rows after migration, add transactions and subscriptions without connectivity, relaunch, and verify persisted rows and balances. Verify pending income clearing, cancellation, tax payment, subscription deletion and empty/loading states. Inspect `PRAGMA user_version` and `PRAGMA integrity_check` when investigating database issues.

Static checks and copied-database SQL checks do not establish on-device runtime acceptance.
