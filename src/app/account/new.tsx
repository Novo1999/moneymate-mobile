import { ModalHeader } from '@/components/ModalHeader'
import { AppText, Button, Field } from '@/components/ui'
import { addAccount } from '@/lib/api/accountType'
import { ApiError } from '@/lib/api/client'
import { dataVersionAtom } from '@/state/atoms'
import { useTheme } from '@/theme/ThemeProvider'
import { useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewAccount() {
  const { colors, radii } = useTheme()
  const { back } = useRouter()
  const bumpData = useSetAtom(dataVersionAtom)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    if (!name.trim()) return setError('Enter an account name')
    setSubmitting(true)
    try {
      await addAccount({ name: name.trim(), balance: Number(balance) || 0 })
      bumpData((v) => v + 1)
      back()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to add account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <ModalHeader title="New Account" />
        <View style={{ gap: 16, marginTop: 8 }}>
          <Field label="Account name" icon="wallet" placeholder="e.g. Savings, Cash, Bank" value={name} onChangeText={setName} autoCapitalize="words" />
          <Field label="Starting balance" icon="currency" placeholder="0.00" keyboardType="decimal-pad" value={balance} onChangeText={(t) => setBalance(t.replace(/[^0-9.]/g, ''))} />
        </View>

        {error ? (
          <View style={{ marginTop: 14, backgroundColor: colors.dangerSoftBg, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.dangerBorder }}>
            <AppText size={12.5} color={colors.danger} style={{ textAlign: 'center' }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button title="Create account" onPress={submit} loading={submitting} style={{ marginTop: 22 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
