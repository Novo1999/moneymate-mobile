/**
 * Native Google Sign-In configuration.
 *
 * Requires a custom dev build — this native module does NOT work in Expo Go.
 * The module is loaded lazily inside a try/catch so the app can still boot in
 * Expo Go (Google sign-in is simply unavailable there).
 *
 * Set these in `.env` (see `.env.example`):
 *  - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID — the "Web client" OAuth client ID from the Google
 *    Cloud console. Required to receive an `idToken` the backend can verify.
 *  - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — the "iOS client" OAuth client ID (iOS only).
 *
 * The iOS URL scheme (reversed iOS client ID) is configured in app.json under the
 * google-signin config plugin's `iosUrlScheme`.
 */
type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin').GoogleSignin

// Importing the package throws in Expo Go (TurboModuleRegistry.getEnforcing),
// so resolve it lazily and treat failure as "not available in this binary".
const GoogleSignin: GoogleSigninModule | null = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- must be a runtime require so the throw is catchable
    return require('@react-native-google-signin/google-signin').GoogleSignin as GoogleSigninModule
  } catch {
    return null
  }
})()

export function configureGoogleSignin() {
  GoogleSignin?.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  })
}

/** Whether Google sign-in can work here: client id configured AND native module present (dev build). */
export function isGoogleConfigured() {
  return (
    GoogleSignin !== null &&
    Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID)
  )
}

/**
 * Triggers the native Google account picker.
 * The resulting `data.idToken` is what we POST to the backend to establish a session.
 */
export async function signInWithGoogle() {
  if (!GoogleSignin) {
    throw new Error('Google sign-in needs a development build — it is not available in Expo Go.')
  }
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  return GoogleSignin.signIn()
}

export async function signOutFromGoogle() {
  try {
    await GoogleSignin?.signOut()
  } catch {
    // best-effort
  }
}
