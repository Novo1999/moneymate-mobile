import { GoogleSignin } from '@react-native-google-signin/google-signin'

/**
 * Native Google Sign-In configuration.
 *
 * Requires a custom dev build — this native module does NOT work in Expo Go.
 *
 * Set these in `.env` (see `.env.example`):
 *  - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID — the "Web client" OAuth client ID from the Google
 *    Cloud console. Required to receive an `idToken` the backend can verify.
 *  - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — the "iOS client" OAuth client ID (iOS only).
 *
 * The iOS URL scheme (reversed iOS client ID) is configured in app.json under the
 * google-signin config plugin's `iosUrlScheme`.
 */
export function configureGoogleSignin() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  })
}

/** Whether a Google client id is configured at all. */
export function isGoogleConfigured() {
  return Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)
}

/**
 * Triggers the native Google account picker.
 * The resulting `data.idToken` is what we POST to the backend to establish a session.
 */
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  return GoogleSignin.signIn()
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin.signOut()
  } catch {
    // best-effort
  }
}
