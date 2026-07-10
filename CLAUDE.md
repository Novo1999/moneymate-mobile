# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Native mobile client for MoneyMate (personal finance tracker). Expo SDK 56 / React Native 0.85 / React 19 with the React Compiler enabled (`app.json` → `experiments.reactCompiler`). It talks to the same backend as the MoneyMate web app and mirrors its API contracts exactly.

## Commands

```bash
npm start                    # expo start (Metro dev server; use Expo Go or a dev client)
npm run android              # build & run native dev client on Android
npm run ios                  # build & run native dev client on iOS
npm run lint                 # expo lint (eslint-config-expo flat config)
npm run prebuild:clean       # regenerate native projects (android/ is checked in)
```

There is no test suite. TypeScript is strict; check types with `npx tsc --noEmit`.

Google sign-in requires a custom dev build (`npm run android` / `npm run ios`) — it does not work in Expo Go. Env vars live in `.env` (see `.env.example` / README): `EXPO_PUBLIC_BASE_URL` (must include `/api/v1`; falls back to the deployed Vercel API), `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.

## Architecture

Path alias: `@/*` → `src/*`, `@/assets/*` → `assets/*`. Routes are file-based via expo-router under `src/app` (entry: `expo-router/entry`).

### Navigation & auth gating (`src/app/_layout.tsx`)

`RootLayout` stacks providers (GestureHandler → Keyboard → SafeArea → Theme → Auth) around `RootNavigator`, which watches `useAuth().status` + current route segments and redirects: unauthenticated → `/auth`, authenticated on `/auth` → `/(tabs)`. Main screens live in `(tabs)/` (Home, Transactions, Accounts, Profile — custom tab bar + FAB in `(tabs)/_layout.tsx`); create/edit flows (`transaction/`, `account/`, `category/new`) are modal `Stack.Screen`s.

### API layer (`src/lib/api/`)

- Every backend response uses the envelope `{ msg, data, status }` (`ApiResponse<T>`); success is decided by HTTP status. `apiClient` in `client.ts` attaches the Bearer token, and on 401 performs **one** transparent refresh (`/auth/refreshToken`, deduped via `refreshInFlight`) then replays the request; if refresh fails it clears the session and fires the `onAuthExpired` callback that `AuthProvider` registers to force logout.
- Endpoint modules (`auth.ts`, `transaction.ts`, `accountType.ts`, `category.ts`) wrap `apiClient` + `requireApiData` and return unwrapped data. Contracts intentionally mirror the web app — don't "fix" oddities like `/transaction/info` resolving to the same handler as `/transaction/user` (backend route-ordering quirk the dashboard relies on).
- There is no single-transaction GET; the edit modal receives its transaction via `editingTransactionAtom`.

### Session (`src/lib/session.ts`)

Tokens persist in `expo-secure-store` but are mirrored in an in-memory variable so `apiClient` can read them synchronously (mirrors the web app's localStorage access). Always go through `persistSession`/`loadSession` — never write SecureStore directly, or the in-memory cache desyncs.

### State (`src/state/`)

Global state is a handful of jotai atoms (`atoms.ts`): `userAtom`, `authStatusAtom`, `activeAccountIdAtom` (the selected account drives dashboard + transactions), `txFilterAtom`, `editingTransactionAtom`, and `dataVersionAtom` — a counter that screens include in their `useAsync` deps; **bump it after any mutation** (add/edit/delete/transfer) so data screens refetch. `useAuth()` (`auth.tsx`) exposes login/register/google/logout/updateUser/setActiveAccount; `register` auto-logs-in then provisions a default "Cash" account, matching the web flow.

### Data fetching

No react-query — screens use `useAsync(fn, deps, enabled?)` (`src/hooks/useAsync.ts`), which refetches when deps change and returns `{ data, loading, error, reload }`.

### Theming (`src/theme/`)

`tokens.ts` defines the teal/mint palette (light + dark), Inter font stack, radii, and shadows; `useTheme()` returns `{ colors, fonts, radii, shadow, mode }`. Components style via `useTheme()` — no styled-components/NativeWind. Reusable primitives (AppText, Button, Card, Field, Screen, Segmented, Pill, empty/loading States…) are in `src/components/ui` and exported from its `index.ts`.

### Forms

react-hook-form + zod resolvers; schemas live in `src/lib/validation/`. Category enums/labels/emoji are in `src/constants/categories.ts`, currency list in `src/constants/currency.ts`.
