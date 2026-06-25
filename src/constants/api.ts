// Configure with EXPO_PUBLIC_BASE_URL.
// Falls back to the deployed API so the app works on a device out of the box.
// NOTE: includes the /api/v1 prefix, matching the web app's NEXT_PUBLIC_BASE_URL.
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'https://moneymate-backend-tau.vercel.app/api/v1'
