import { Icon } from '@/components/Icon'
import { ModalHeader } from '@/components/ModalHeader'
import { AmountInput, AppText, Button, Card, Field } from '@/components/ui'
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
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TransferScreen() {
  const { colors, radii } = useTheme()
  const { back } = useRouter()
  const { user } = useAuth()
  const bumpData = useSetAtom(dataVersionAtom)
  const accountsQ = useAsync(() => listAccounts(), [])
  const accounts = accountsQ.data ?? []

  const [fromSel, setFromSel] = useState<number | null>(null)
  const [toSel, setToSel] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Defaults are derived (not set in an effect) so they're ready as soon as accounts load.
  const fromId = fromSel ?? accounts[0]?.id ?? null
  const toId = toSel ?? accounts.find((a) => a.id !== fromId)?.id ?? null
  const fromAccount = accounts.find((a) => a.id === fromId)
  const available = Number(fromAccount?.balance ?? 0)

  // Picking the account already selected on the other side swaps the two.
  const selectFrom = (id: number) => {
    if (id === toId) setToSel(fromId)
    setFromSel(id)
  }
  const selectTo = (id: number) => {
    if (id === fromId) setFromSel(toId)
    setToSel(id)
  }
  const swapAccounts = () => {
    setFromSel(toId)
    setToSel(fromId)
  }

  const setPctOfBalance = (pct: number) => {
    // Balances can be negative — clamp so the buttons never produce a negative amount.
    setAmount(String(Math.max(0, Math.floor(available * pct * 100) / 100)))
  }

  const submit = async () => {
    setError(null)
    const value = Number(amount)
    if (!fromId || !toId) return setError('Pick both accounts')
    if (fromId === toId) return setError('Choose two different accounts')
    if (!value || value <= 0) return setError('Enter an amount greater than 0')
    if (fromAccount && value > available)
      return setError(`Not enough balance in ${fromAccount.name} (available: ${formatMoney(available, user?.currency)})`)
    setSubmitting(true)
    try {
      await transferBalance({ fromAccountId: fromId, toAccountId: toId, amount: value, note: note || undefined })
      bumpData((v) => v + 1)
      back()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Transfer failed')
    } finally {
      setSubmitting(false)
    }
  }

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
            {/* Amount hero */}
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: radii.xxl, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' }}
            >
              <AppText size={12.5} color="rgba(255,255,255,0.85)" weight="semibold">
                Amount to transfer
              </AppText>
              <AmountInput
                symbol={currencySymbol(user?.currency)}
                value={amount}
                onChangeText={setAmount}
                color="#fff"
                placeholderColor="rgba(255,255,255,0.45)"
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                {([
                  { label: '25%', pct: 0.25 },
                  { label: '50%', pct: 0.5 },
                  { label: 'Max', pct: 1 },
                ] as const).map((p) => (
                  <Pressable
                    key={p.label}
                    onPress={() => setPctOfBalance(p.pct)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: radii.pill,
                      backgroundColor: pressed ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
                    })}
                  >
                    <AppText size={12} weight="bold" color="#fff">
                      {p.label}
                    </AppText>
                  </Pressable>
                ))}
              </View>
              {fromAccount ? (
                <AppText size={11.5} color="rgba(255,255,255,0.85)" weight="medium" style={{ marginTop: 12 }}>
                  Available in {fromAccount.name} · {formatMoney(available, user?.currency)}
                </AppText>
              ) : null}
            </LinearGradient>

            {/* From / To */}
            <Card style={{ marginTop: 18 }} padding={16}>
              <AccountSelector label="From" accounts={accounts} selectedId={fromId} currency={user?.currency} onSelect={selectFrom} />

              <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 6 }}>
                <View style={{ position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.border }} />
                <Pressable
                  onPress={swapAccounts}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: colors.primarySoftBg,
                    borderWidth: 1,
                    borderColor: colors.borderStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  })}
                >
                  <Icon name="activity" size={21} color={colors.primary} />
                </Pressable>
              </View>

              <AccountSelector label="To" accounts={accounts} selectedId={toId} currency={user?.currency} onSelect={selectTo} />
            </Card>

            <View style={{ marginTop: 18 }}>
              <Field label="Note (optional)" placeholder="What's this for?" value={note} onChangeText={setNote} autoCapitalize="sentences" />
            </View>

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

function AccountSelector({
  label,
  accounts,
  selectedId,
  currency,
  onSelect,
}: {
  label: string
  accounts: AccountType[]
  selectedId: number | null
  currency?: string
  onSelect: (id: number) => void
}) {
  const { colors, radii } = useTheme()
  const chipInner = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
  } as const

  return (
    <View>
      <AppText weight="bold" size={13} color={colors.muted} style={{ marginBottom: 10, marginLeft: 2 }}>
        {label}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {accounts.map((a) => {
          const selected = a.id === selectedId
          const badge = (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                backgroundColor: selected ? 'rgba(255,255,255,0.22)' : colors.primarySoftBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="wallet" size={17} color={selected ? '#fff' : colors.primary} />
            </View>
          )
          const text = (
            <View>
              <AppText weight="bold" size={13} color={selected ? '#fff' : colors.heading}>
                {a.name}
              </AppText>
              <AppText size={11} color={selected ? 'rgba(255,255,255,0.85)' : colors.mutedSoft} style={{ marginTop: 2 }}>
                {formatMoney(a.balance, currency)}
              </AppText>
            </View>
          )
          return (
            <Pressable key={a.id} onPress={() => onSelect(a.id)}>
              {selected ? (
                <LinearGradient
                  colors={colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[chipInner, { borderColor: 'rgba(255,255,255,0.25)' }]}
                >
                  {badge}
                  {text}
                </LinearGradient>
              ) : (
                <View style={[chipInner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {badge}
                  {text}
                </View>
              )}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
