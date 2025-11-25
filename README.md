# Smart Expense Tracker

A React Native app that automatically tracks your expenses by reading bank SMS messages. Built for Android with offline-first architecture.

## What it does

Instead of manually entering every expense, this app reads your bank transaction SMS and automatically creates expense entries. It categorizes transactions, shows spending insights, and keeps everything stored locally on your device.

## Features

- **Automatic SMS tracking** - Reads bank transaction messages and creates expenses automatically
- **Smart categorization** - Automatically sorts expenses into categories (Food, Transport, Shopping, etc.)
- **Visual insights** - Charts and graphs showing where your money goes
- **Offline-first** - Everything works without internet, data stays on your device
- **Manual entry** - Can still add expenses manually if needed
- **Transaction history** - View, filter, and search all your expenses

## Tech Stack

- React Native 0.82
- TypeScript
- Redux Toolkit (state management)
- SQLite (local database)
- React Native Paper (UI components)
- Victory Native (charts)

## Getting Started

### Prerequisites

- Node.js 20+
- Android Studio (for Android development)
- React Native development environment set up

If you haven't set up React Native yet, follow the [official setup guide](https://reactnative.dev/docs/set-up-your-environment).

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd SmartExpenseTracker

# Install dependencies
npm install

# Apply patches (fixes for deprecated dependencies)
npm run postinstall
```

### Running the App

```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

The app should launch on your Android emulator or connected device.

### First Launch

On first launch, you'll see:
1. Onboarding screens explaining the app
2. SMS permission request (needed for auto-tracking)
3. Dashboard with your expenses

If you skip the SMS permission, you can enable it later from the Settings tab.

## Project Structure

```
src/
├── components/       # Reusable UI components
├── db/              # SQLite database setup and queries
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── screens/         # App screens
├── services/        # Business logic (SMS parsing, auto-tracking)
├── store/           # Redux store and slices
├── theme/           # Theme and styling
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## Key Files

- `src/services/smsParser.ts` - Parses bank SMS messages
- `src/services/smsAutoTracker.ts` - Handles automatic transaction creation
- `src/db/database.ts` - SQLite database operations
- `src/store/transactionSlice.ts` - Transaction state management

## Development

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Known Issues & Fixes

### jcenter() Deprecated Error

If you see build errors about `jcenter()`, the patches should fix this automatically. The app uses `patch-package` to replace deprecated `jcenter()` with `mavenCentral()` in:
- `react-native-get-sms-android`
- `react-native-sqlite-storage`

Patches are in the `patches/` folder and applied automatically after `npm install`.

### SMS Permission

SMS reading only works on Android. The app will show a message on iOS devices explaining this limitation.

## Troubleshooting

### App crashes on launch
- Clear app data: `adb shell pm clear com.smartexpensetracker`
- Rebuild: `npm run android`

### SMS not being tracked
- Check if SMS permission is granted in Settings tab
- Verify you're on Android (iOS doesn't support SMS reading)
- Check logs for parsing errors: `npx react-native log-android`

### Build fails
- Clean build: `cd android && ./gradlew clean && cd ..`
- Clear Metro cache: `npm start -- --reset-cache`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Testing SMS Parsing

To test without real bank SMS, you can modify the SMS parser to accept test messages. Check `src/services/smsParser.ts` for the parsing logic.

Currently supports common Indian bank SMS formats (HDFC, ICICI, SBI, Axis, etc.).

## Privacy & Security

- All data stored locally in SQLite
- No cloud sync or external servers
- SMS messages are only read, never sent or shared
- App doesn't have internet permission (offline-only)

## Contributing

Feel free to open issues or submit PRs. Main areas for improvement:
- Support for more bank SMS formats
- Better categorization logic
- Export/backup features
- Budget tracking

## License

MIT

## Notes

This is a personal expense tracking app focused on privacy and offline functionality. It's not meant to replace full-featured finance apps but provides a simple, automatic way to track daily expenses from bank SMS.


## Testing with Emulator SMS

You can simulate bank SMS messages on the Android emulator using these ADB commands:

# HDFC Bank SMS
adb emu sms send HDFCBK "Your A/c XX1234 debited with Rs.450.00 on 26-11-2024 at Starbucks Coffee. Avl Bal: Rs.15,250.00"

# Axis Bank SMS
adb emu sms send AXISBK "Rs.350.00 debited from A/c XX9012 on 26-11-2024 at Uber India. Avl Bal: Rs.8,750.00"

# ICICI Bank SMS
adb emu sms send ICICIB "Your A/c XX5678 debited for Rs.1,250.50 on 26-11-2024 for purchase at Amazon India. Available balance: Rs.25,500.00"

# SBI Bank SMS
adb emu sms send SBIIN "Your SBI A/c XX3456 debited with Rs.2,500.00 on 26-11-2024 for payment at Reliance Digital. Available Bal: Rs.45,200.00"


testing video Android Emulator

