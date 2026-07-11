import { Icon } from '@/components/Icon'
import { AppText, Button, Field, Pill, Segmented } from '@/components/ui'
import { POPULAR_CURRENCIES } from '@/constants/currency'
import { ApiError } from '@/lib/api/client'
import { isGoogleConfigured } from '@/lib/googleSignin'
import { authSchema, type AuthFormValues } from '@/lib/validation/auth'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'

type Mode = 'signin' | 'signup'

export default function AuthScreen() {
  const { colors, radii } = useTheme()
  const { login, loginWithGoogle, register } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { mode: 'signin', name: '', email: '', password: '', confirmPassword: '', currency: 'USD' },
  })

  // useWatch (not watch()) — subscription-based, so it stays React Compiler compatible.
  const currency = useWatch({ control, name: 'currency' })

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    // Start the other tab with a clean slate — values must not leak between sign in and sign up.
    reset({ mode: next, name: '', email: '', password: '', confirmPassword: '', currency: 'USD' })
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      if (values.mode === 'signin') {
        await login({ email: values.email, password: values.password })
      } else {
        await register({
          name: values.name!.trim(),
          email: values.email,
          password: values.password,
          currency: values.currency || 'USD',
        })
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.')
    }
  })

  const onGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (e) {
      const code = (e as { code?: string })?.code
      setError(e instanceof ApiError ? e.message : `Google sign-in failed${code ? ` (${code})` : ''}.`)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['bottom']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={24}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Brand header */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 64, paddingBottom: 40, paddingHorizontal: 28, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 }}
        >
          <Image
            source={require('@/assets/images/logo-mark.png')}
            style={{ width: 64, height: 64, marginBottom: 18 }}
            contentFit="contain"
          />
          <AppText variant="heading" size={30} color="#fff">
            MoneyMate
          </AppText>
          <AppText size={14} color="rgba(255,255,255,0.9)" style={{ marginTop: 6, maxWidth: 260, lineHeight: 20 }}>
            {mode === 'signin' ? 'Welcome back. Track every dollar with clarity.' : 'Create your account and take control of your money.'}
          </AppText>
        </LinearGradient>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <View style={{ marginBottom: 20 }}>
            <Segmented
              value={mode}
              onChange={switchMode}
              options={[
                { value: 'signin', label: 'Sign in' },
                { value: 'signup', label: 'Create account' },
              ]}
            />
          </View>

          <View style={{ gap: 16 }}>
            {mode === 'signup' ? (
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Field
                    label="Full name"
                    icon="account"
                    placeholder="Novo Rony"
                    autoCapitalize="words"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Email"
                  icon="mail"
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label="Password"
                  icon="lock"
                  secure
                  placeholder="Your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            {mode === 'signup' ? (
              <>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Field
                      label="Confirm password"
                      icon="lock"
                      secure
                      placeholder="Re-enter password"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
                <View>
                  <AppText weight="semibold" size={12} color={colors.muted} style={{ marginBottom: 8, marginLeft: 2 }}>
                    Currency
                  </AppText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {POPULAR_CURRENCIES.map((c) => (
                      <Pill key={c} label={c} active={currency === c} onPress={() => setValue('currency', c)} />
                    ))}
                  </ScrollView>
                  {errors.currency?.message ? (
                    <AppText size={12} color={colors.danger} style={{ marginTop: 6, marginLeft: 2 }}>
                      {errors.currency.message}
                    </AppText>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>

          {error ? (
            <View style={{ marginTop: 14, backgroundColor: colors.dangerSoftBg, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.dangerBorder }}>
              <AppText size={12.5} color={colors.danger} style={{ textAlign: 'center' }}>
                {error}
              </AppText>
            </View>
          ) : null}

          <Button
            title={mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={onSubmit}
            loading={isSubmitting}
            style={{ marginTop: 20 }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <AppText size={11} color={colors.mutedSoft}>
              or continue with
            </AppText>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <Pressable
            onPress={onGoogle}
            disabled={googleLoading}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderWidth: 1,
              borderColor: colors.borderStrong,
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              paddingVertical: 15,
              opacity: googleLoading ? 0.6 : pressed ? 0.85 : 1,
            })}
          >
            {googleLoading ? <ActivityIndicator color={colors.text} /> : <Icon name="google" size={20} color="#EA4335" />}
            <AppText weight="bold" size={14} color={colors.text}>
              Continue with Google
            </AppText>
          </Pressable>

          {!isGoogleConfigured() ? (
            <AppText size={11} color={colors.mutedSoft} style={{ textAlign: 'center', marginTop: 10, lineHeight: 16 }}>
              Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env and run a dev build to enable Google sign-in.
            </AppText>
          ) : null}

          <Pressable onPress={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} style={{ marginTop: 26 }}>
            <AppText size={13.5} color={colors.muted} style={{ textAlign: 'center' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <AppText size={13.5} weight="bold" color={colors.primary}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </AppText>
            </AppText>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
