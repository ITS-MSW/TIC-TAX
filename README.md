# TIC-TAX v1.2.0 ⏳🩸

> A brutalist, offline-first financial ledger for freelancers who enjoy survival math more than corporate fluff.

TIC-TAX is a mobile app for tracking cash flow, quarantining taxes, managing recurring burn, and calculating how long you can keep pretending your “freelance lifestyle” is sustainable.

Version `1.2.0` is the big one:

- Local-only SQLite ledger and subscription storage
- Runway tab for recurring costs and survival clock
- Long-press deletion flows for transactions and subscriptions
- Tax Hostage reset flow for cleared taxes
- Android edge-to-edge and keyboard handling fixes

No charts for the sake of charts. No SaaS nonsense. Just the numbers that matter.

## Core Philosophy

- The 3-second loop matters. If logging takes longer, the UI failed.
- Time is the real currency. Every expense should tell you how much life it burns.
- Taxes are not “available balance.” Pending invoices are not cash. Reality wins.
- Your ledger should work offline without an account or network connection.
- JS-thread abuse is a crime. Keep the UI native, fast, and boring where it needs to be.


### Local SQLite Storage

- Transactions and subscriptions live in local SQLite as the only persistence layer.
- Transaction inserts update local state optimistically and roll back that state if persistence fails.
- Subscription changes update local state after persistence succeeds.
- Data stays on the device; there is no account, cloud persistence, or cross-device sync.

### Runway Tab

- Added recurring subscriptions to model monthly burn.
- Added the Survival Clock to calculate runway in months.
- Critical runway state highlights the problem in red instead of politely suggesting it.

### Deletion and Tax Controls

- Long-press deletion is wired for transactions and subscriptions.
- Tax Hostage can be reset once taxes are marked as paid.
- No swipey nonsense, no accidental taps, no nonsense “are you sure?” theater beyond native alerts.

### Android Stability

- Edge-to-edge safe-area handling is fixed for modern Android.
- Android nav bar styling is configured natively.
- Bottom sheet inputs use `BottomSheetTextInput` so the keyboard behaves like it should have in the first place.

## Tech Stack

- [Expo](https://expo.dev/) SDK 58 / React Native 0.88
- [Expo Router](https://docs.expo.dev/router/introduction/)
- `react-native-nitro-sqlite` and `react-native-nitro-modules` for native SQLite ledger and subscription storage
- [Uniwind](https://uniwind.dev/) for styling
- [HeroUI Native](https://heroui.com/) for UI primitives
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for motion
- [Bun](https://bun.sh/) as the package manager

## Key Features

### 1. The Pulse

Your main ledger. Tracks income, expenses, tax withholding, and the actual safe-to-spend balance. It is the app’s rude little accountant.

### 2. The Runway

Models recurring monthly burn and calculates how many months of survival you have left. It shows monthly burn, safe capital, and a survival clock that gets ugly when the math gets ugly.

### 3. The Waiting Room

Tracks pending income separately from real cash so invoices do not magically become spendable money just because you feel optimistic.

### 4. The Regret Sandbox

Lets you simulate a purchase before you do something expensive and stupid. It tells you how many days of survival the item costs and how much income you need to recover it.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PURPLE-ORCA/TIC-TAX.git
cd tic-tax
```

### 2. Install dependencies

```bash
bun install
```

### 3. Build and start the native app

Nitro SQLite requires a native development build; it does not run in Expo Go. Use an Android emulator/device or an iOS simulator/device:

```bash
bun run android
bun run ios
```

After installing the development build, `bun run dev` starts Metro for development. Web persistence is outside the supported mobile-only scope. No backend environment variables are required.

## Architecture Notes

- `react-native-nitro-sqlite` opens `SQLite/tic-tax-ledger.db` in the app data directory, preserving the existing database path.
- Versioned transactional migrations run before the transaction and subscription Zustand stores hydrate.
- Money is stored as integer cents; `toCents` and `centsToAmount` handle input and display conversion.
- See [local storage details](docs/offline-mode.md) for schema and lifecycle notes.
- Expo Router owns navigation. No custom router circus.
- Bottom sheets, navigation bar handling, and safe-area insets are configured for modern Android behavior.

## Development Commands

```bash
bun run dev
bun run android
bun run ios
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run typecheck
```

## Contributing

Keep contributions aligned with the app’s actual job:

- Keep the ledger fast.
- Keep migrations data-preserving and local persistence deterministic.
- Keep UI friction low.
- Do not reintroduce state management theater or JS-thread animations just to feel productive.

## License

MIT License. Use it, fork it, break it, just do not blame the app when your runway hits zero.
