import { Icon } from '@/components/Icon'
import { AppText, Card, IconButton } from '@/components/ui'
import { EmptyState, Loader } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { listAccounts } from '@/lib/api/accountType'
import { formatMoney } from '@/lib/format'
import { dataVersionAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import type { AccountType } from '@/types/models'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useAtomValue } from 'jotai'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const CARD_GRADIENTS: [string, string][] = [
  ['#0D9488', '#14B8A6'],
  ['#0B3C49', '#0D9488'],
  ['#134E4A', '#0F766E'],
  ['#0F766E', '#2DD4BF'],
]

export default function AccountsScreen() {
  const { colors, radii } = useTheme()
  const { push } = useRouter()
  const { user, activeAccountId, setActiveAccount } = useAuth()
  const dataVersion = useAtomValue(dataVersionAtom)
  const accountsQ = useAsync(() => listAccounts(), [dataVersion])

  const accounts = accountsQ.data ?? []
  const netWorth = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={accountsQ.loading} onRefresh={accountsQ.reload} tintColor={colors.primary} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 18 }}>
          <AppText variant="heading" size={24} color={colors.heading}>
            Accounts
          </AppText>
          <IconButton name="transfer" onPress={() => push('/account/transfer')} />
        </View>

        <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }} padding={18}>
          <View>
            <AppText size={12} color={colors.muted} weight="semibold">
              Net Worth
            </AppText>
            <AppText variant="heading" size={24} color={colors.heading} style={{ marginTop: 4 }}>
              {formatMoney(netWorth, user?.currency)}
            </AppText>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: radii.lg, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bank" size={24} color={colors.primary} />
          </View>
        </Card>

        {accountsQ.loading && accounts.length === 0 ? (
          <Loader />
        ) : accounts.length === 0 ? (
          <EmptyState icon="cards" title="No accounts yet" subtitle="Add your first account to start tracking." />
        ) : (
          accounts.map((account, i) => (
            <AccountCard
              key={account.id}
              account={account}
              currency={user?.currency}
              gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
              isActive={account.id === activeAccountId}
              onPress={() => push({ pathname: '/account/[id]', params: { id: String(account.id) } })}
              onSetActive={() => setActiveAccount(account.id)}
            />
          ))
        )}

        <Pressable
          onPress={() => push('/account/new')}
          style={{
            marginTop: 6,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.dashBorder,
            backgroundColor: colors.dashBg,
            borderRadius: radii.lg,
            paddingVertical: 18,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="plus" size={18} color={colors.primary} />
          <AppText weight="bold" size={14} color={colors.primary}>
            Add new account
          </AppText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function AccountCard({
  account,
  currency,
  gradient,
  isActive,
  onPress,
  onSetActive,
}: {
  account: AccountType
  currency?: string
  gradient: [string, string]
  isActive: boolean
  onPress: () => void
  onSetActive: () => void
}) {
  const { radii } = useTheme()
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 14 }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radii.xl, padding: 20, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="wallet" size={16} color="rgba(255,255,255,0.9)" />
            <AppText size={13} color="rgba(255,255,255,0.9)" weight="semibold">
              {account.name}
            </AppText>
          </View>
          <Pressable onPress={onSetActive} hitSlop={8} style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <AppText size={11} weight="bold" color="#fff">
              {isActive ? 'Active' : 'Set active'}
            </AppText>
          </Pressable>
        </View>
        <AppText variant="heading" size={28} color="#fff" style={{ marginTop: 14 }}>
          {formatMoney(account.balance, currency)}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <AppText size={12} color="rgba(255,255,255,0.85)">
            •••• {String(account.id).padStart(4, '0')}
          </AppText>
          <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.85)" />
        </View>
      </LinearGradient>
    </Pressable>
  )
}
