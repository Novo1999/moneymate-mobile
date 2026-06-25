# MoneyMate Mobile

Native mobile client for **MoneyMate** — a personal finance tracker. Built with **Expo SDK 56**, expo-router, TypeScript, jotai, react-hook-form + zod, and react-native-svg. It talks to the same backend as the web app and adds native **Google sign-in**.

## Stack

- **Expo SDK 56** / React Native 0.85 / React 19 (React Compiler enabled)
- **expo-router** (file-based, `src/app`)
- **jotai** for global state (auth, active account, filters)
- **react-hook-form + zod** for forms & validation
- **expo-secure-store** for the persisted session (access + refresh tokens)
- **@react-native-google-signin/google-signin** for native Google auth
- **react-native-svg** for the donut chart, **expo-linear-gradient** for brand surfaces
- Inter (via `@expo-google-fonts/inter`), teal/mint theme mirroring the web app

## Features

- Email/password **sign in + sign up** (sign-up provisions a default "Cash" account, matching the web flow) and **Google sign-in**
- **Dashboard**: balance hero, this-month income/expense, spending donut by category, recent activity
- **Transactions**: filter by type/category, day-grouped infinite list
- **Add / edit / delete** transactions with category grid, account picker, date & note
- **Accounts**: gradient cards, net worth, set-active, edit/delete, **transfer between accounts**
- **Categories**: manage custom income/expense categories
- **Profile**: currency picker, dark mode, quick links; secure logout
- Transparent **access-token refresh** on 401, forced logout when the refresh fails

## Setup

```bash
npm install
cp .env.example .env   # then fill in values
npx expo start
```

### Environment (`.env`)

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_BASE_URL` | Backend base URL incl. `/api/v1`. Defaults to the deployed Vercel API. Use your machine's LAN IP (not `localhost`) for a local backend on a device. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google "Web client" OAuth ID — required to receive an `idToken` the backend verifies. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google "iOS client" OAuth ID (iOS only). |

## Google sign-in (native)

Native Google sign-in needs a **custom dev build** — it does **not** work in Expo Go.

1. In Google Cloud Console create OAuth client IDs: a **Web** client (used as `webClientId`) and an **iOS** client.
2. Put the Web client ID in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (and iOS in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`).
3. Set the reversed iOS client ID in `app.json` → google-signin plugin `iosUrlScheme`.
4. On the **backend**, set `GOOGLE_CLIENT_ID` to the same Web client ID (comma-separate to also allow the iOS client ID). The mobile app sends the `idToken` to `POST /auth/google`, which verifies it (`google-auth-library`), finds-or-creates the user, and returns the standard `{ accessToken, refreshToken }` session.
5. Build & run a dev client:

```bash
npx expo run:android   # or: npx expo run:ios
```

## Project structure

```
src/
  app/                 # expo-router routes
    _layout.tsx        # providers + auth-gated navigation
    auth.tsx           # sign in / sign up + Google
    (tabs)/            # Home, Transactions, Accounts, Profile (custom tab bar + FAB)
    transaction/       # new + [id] (edit) modals
    account/           # new, [id], transfer modals
    category/new.tsx
    categories.tsx
  components/          # Icon, DonutChart, TransactionRow, UI primitives
  constants/           # api, categories (enums/labels/emoji), currency
  hooks/               # useAsync
  lib/                 # api client + endpoints, session, googleSignin, format, insights
  state/               # jotai atoms + AuthProvider/useAuth
  theme/               # tokens (teal palette) + ThemeProvider
  types/
```

The API layer mirrors the web app's contracts exactly (auth, account types, transactions w/ pagination & filters, categories), including the `{ msg, data, status }` response envelope and the transparent refresh-token flow.
