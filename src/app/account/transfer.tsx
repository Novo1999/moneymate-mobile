import { Icon } from '@/components/Icon'
import { ModalHeader } from '@/components/ModalHeader'
import { AmountInput, AppText, Button, Field } from '@/components/ui'
import { EmptyState, Loader } from '@/components/ui/States'
import { currencySymbol } from '@/constants/currency'
import { useAsync } from '@/hooks/useAsync'
import { listAccounts, transferBalance } from '@/lib/api/accountType'
import { ApiError } from '@/lib/api/client'
import { formatMoney } from '@/lib/format'
import { dataVersionAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import type { AccountType } from '@/types/models'
import { useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TransferScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const bumpData = useSetAtom(dataVersionAtom)
  const accountsQ = useAsync(() => listAccounts(), [])
  const accounts = accountsQ.data ?? []

  const [fromId, setFromId] = useState<number | null>(null)
  const [toId, setToId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (accounts.length && fromId === null) {
      setFromId(accounts[0].id)
      setToId(accounts[1]?.id ?? null)
    }
  }, [accounts, fromId])

  const submit = async () => {
    setError(null)
    const value = Number(amount)
    if (!fromId || !toId) return setError('Pick both accounts')
    if (fromId === toId) return setError('Choose two different accounts')
    if (!value || value <= 0) return setError('Enter an amount greater than 0')
    setSubmitting(true)
    try {
      await transferBalance({ fromAccountId: fromId, toAccountId: toId, amount: value, note: note || undefined })
      bumpData((v) => v + 1)
      router.back()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Transfer failed')
    } finally {
      setSubmitting(false)
    }
  }

  const Selector = ({ label, selectedId, onSelect, exclude }: { label: string; selectedId: number | null; onSelect: (id: number) => void; exclude?: number | null }) => (
    <View style={{ marginBottom: 18 }}>
      <AppText weight="bold" size={13} color={colors.muted} style={{ marginBottom: 12, marginLeft: 2 }}>
        {label}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {accounts.map((a: AccountType) => {
          const selected = a.id === selectedId
          const disabled = a.id === exclude
          return (
            <Pressable
              key={a.id}
              disabled={disabled}
              onPress={() => onSelect(a.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 13,
                borderRadius: radii.md,
                opacity: disabled ? 0.4 : 1,
                backgroundColor: selected ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <AppText weight="bold" size={13} color={selected ? '#fff' : colors.heading}>
                {a.name}
              </AppText>
              <AppText size={11} color={selected ? 'rgba(255,255,255,0.85)' : colors.mutedSoft} style={{ marginTop: 2 }}>
                {formatMoney(a.balance, user?.currency)}
              </AppText>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={24}
      >
        <ModalHeader title="Transfer Money" />

        {accountsQ.loading ? (
          <Loader />
        ) : accounts.length < 2 ? (
          <EmptyState icon="transfer" title="Need two accounts" subtitle="Add another account to transfer money between them." />
        ) : (
          <>
            <Selector label="From" selectedId={fromId} onSelect={setFromId} exclude={toId} />
            <View style={{ alignItems: 'center', marginVertical: -6 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="arrow-down" size={20} color={colors.primary} />
              </View>
            </View>
            <Selector label="To" selectedId={toId} onSelect={setToId} exclude={fromId} />

            <View style={{ alignItems: 'center', marginVertical: 14 }}>
              <AppText size={13} color={colors.muted} weight="semibold">
                Amount
              </AppText>
              <AmountInput symbol={currencySymbol(user?.currency)} value={amount} onChangeText={setAmount} />
            </View>

            <Field label="Note (optional)" placeholder="What's this for?" value={note} onChangeText={setNote} autoCapitalize="sentences" />

            {error ? (
              <View style={{ marginTop: 14, backgroundColor: colors.dangerSoftBg, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.dangerBorder }}>
                <AppText size={12.5} color={colors.danger} style={{ textAlign: 'center' }}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <Button title="Transfer" icon="transfer" onPress={submit} loading={submitting} style={{ marginTop: 20 }} />
          </>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
