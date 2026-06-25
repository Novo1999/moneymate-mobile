import { ModalHeader } from '@/components/ModalHeader'
import { TransactionRow } from '@/components/TransactionRow'
import { AppText, Button, Field } from '@/components/ui'
import { EmptyState, Loader } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { deleteAccount, editAccount, getAccount } from '@/lib/api/accountType'
import { ApiError } from '@/lib/api/client'
import { getTransactionsPaginated } from '@/lib/api/transaction'
import { formatMoney } from '@/lib/format'
import { dataVersionAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AccountDetail() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const accountId = Number(id)
  const { user, activeAccountId, setActiveAccount } = useAuth()
  const bumpData = useSetAtom(dataVersionAtom)

  const accountQ = useAsync(() => getAccount(accountId), [accountId])
  const txQ = useAsync(() => getTransactionsPaginated(accountId, 0, 8), [accountId])

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (accountQ.data?.name) setName(accountQ.data.name)
  }, [accountQ.data?.name])

  const account = accountQ.data
  const isActive = account?.id === activeAccountId
  const transactions = txQ.data?.transactions ?? []

  const save = async () => {
    setError(null)
    if (!name.trim()) return setError('Enter a name')
    setSaving(true)
    try {
      await editAccount(accountId, { name: name.trim() })
      bumpData((v) => v + 1)
      router.back()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = () => {
    Alert.alert('Delete account', 'This permanently deletes the account and its transactions.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount(accountId)
            bumpData((v) => v + 1)
            router.back()
          } catch (e) {
            setError(e instanceof ApiError ? e.message : 'Failed to delete')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <ModalHeader title="Account" />

        {accountQ.loading && !account ? (
          <Loader />
        ) : !account ? (
          <EmptyState icon="cards" title="Account not found" />
        ) : (
          <>
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radii.xl, padding: 22 }}>
              <AppText size={13} color="rgba(255,255,255,0.9)" weight="semibold">
                {account.name}
              </AppText>
              <AppText variant="heading" size={32} color="#fff" style={{ marginTop: 8 }}>
                {formatMoney(account.balance, user?.currency)}
              </AppText>
            </LinearGradient>

            <View style={{ marginTop: 20, gap: 14 }}>
              <Field label="Account name" icon="wallet" value={name} onChangeText={setName} autoCapitalize="words" />
              <Button title={isActive ? 'Active account' : 'Set as active'} variant={isActive ? 'soft' : 'outline'} icon={isActive ? 'check' : 'cards'} onPress={() => setActiveAccount(account.id)} />
            </View>

            {error ? (
              <View style={{ marginTop: 14, backgroundColor: colors.dangerSoftBg, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.dangerBorder }}>
                <AppText size={12.5} color={colors.danger} style={{ textAlign: 'center' }}>
                  {error}
                </AppText>
              </View>
            ) : null}

            <Button title="Save changes" onPress={save} loading={saving} style={{ marginTop: 18 }} />
            <Button title="Delete account" variant="danger" icon="trash" onPress={confirmDelete} style={{ marginTop: 12 }} />

            <AppText variant="heading" size={16} color={colors.heading} style={{ marginTop: 28, marginBottom: 14 }}>
              Recent activity
            </AppText>
            {txQ.loading ? (
              <Loader size="small" />
            ) : transactions.length === 0 ? (
              <EmptyState icon="activity" title="No transactions" subtitle="This account has no activity yet." />
            ) : (
              <View style={{ gap: 11 }}>
                {transactions.map((t) => (
                  <TransactionRow key={t.id} transaction={t} currency={user?.currency} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
