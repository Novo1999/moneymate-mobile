import { Icon, type IconName } from '@/components/Icon'
import { DonutChart } from '@/components/DonutChart'
import { TransactionRow } from '@/components/TransactionRow'
import { AppText, Avatar, Card } from '@/components/ui'
import { EmptyState, Loader } from '@/components/ui/States'
import { categoryLabel } from '@/constants/categories'
import { listAccounts } from '@/lib/api/accountType'
import { getTransactionInfo, getTransactionsPaginated } from '@/lib/api/transaction'
import { formatMoney } from '@/lib/format'
import { expenseByCategory, summarize } from '@/lib/insights'
import { useAsync } from '@/hooks/useAsync'
import { dataVersionAtom, editingTransactionAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const { user, activeAccountId } = useAuth()
  const dataVersion = useAtomValue(dataVersionAtom)
  const setEditingTx = useSetAtom(editingTransactionAtom)

  const { from, to } = useMemo(() => {
    const now = new Date()
    return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() }
  }, [])

  const accountsQ = useAsync(() => listAccounts(), [dataVersion])
  const infoQ = useAsync(
    () => getTransactionInfo(activeAccountId!, from, to),
    [activeAccountId, from, to, dataVersion],
    !!activeAccountId,
  )
  const recentQ = useAsync(
    () => getTransactionsPaginated(activeAccountId!, 0, 6),
    [activeAccountId, dataVersion],
    !!activeAccountId,
  )

  const accounts = accountsQ.data ?? []
  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? accounts[0]
  const monthTx = infoQ.data?.transactions ?? []
  const { income, expense } = useMemo(() => summarize(monthTx), [monthTx])
  const slices = useMemo(() => expenseByCategory(monthTx), [monthTx])
  const topSlices = slices.slice(0, 4)

  const segments = topSlices.map((s, i) => ({ value: s.total, color: colors.chart[i % colors.chart.length] }))
  const recent = recentQ.data?.transactions ?? []

  const refreshing = accountsQ.loading || infoQ.loading || recentQ.loading
  const onRefresh = () => {
    accountsQ.reload()
    infoQ.reload()
    recentQ.reload()
  }

  const quickActions: { icon: IconName; label: string; onPress: () => void; primary?: boolean }[] = [
    { icon: 'plus', label: 'Add', onPress: () => router.push('/transaction/new'), primary: true },
    { icon: 'transfer', label: 'Transfer', onPress: () => router.push('/account/transfer') },
    { icon: 'tag', label: 'Categories', onPress: () => router.push('/categories') },
    { icon: 'chart-pie', label: 'Accounts', onPress: () => router.push('/(tabs)/accounts') },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={user?.name} />
            <View>
              <AppText size={13} color={colors.muted} weight="medium">
                {greeting()} 👋
              </AppText>
              <AppText variant="heading" size={20} color={colors.heading} style={{ marginTop: 1 }}>
                {user?.name?.split(' ')[0] ?? 'there'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Balance hero */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: radii.xxl, padding: 22, overflow: 'hidden' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="wallet" size={15} color="rgba(255,255,255,0.9)" />
            <AppText size={13} color="rgba(255,255,255,0.9)" weight="semibold">
              Total Balance · {activeAccount?.name ?? '—'}
            </AppText>
          </View>
          <AppText variant="heading" size={38} color="#fff" style={{ marginTop: 8 }}>
            {formatMoney(activeAccount?.balance ?? 0, user?.currency)}
          </AppText>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <HeroChip icon="arrow-up" label="Income" value={formatMoney(income, user?.currency)} />
            <HeroChip icon="arrow-down" label="Expense" value={formatMoney(expense, user?.currency)} />
          </View>
        </LinearGradient>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 }}>
          {quickActions.map((a) => (
            <Pressable key={a.label} onPress={a.onPress} style={{ alignItems: 'center', gap: 8, flex: 1 }}>
              {a.primary ? (
                <LinearGradient
                  colors={colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 56, height: 56, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name={a.icon} size={23} color="#fff" />
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radii.lg,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={a.icon} size={23} color={colors.primary} />
                </View>
              )}
              <AppText size={12} weight="semibold" color={colors.muted}>
                {a.label}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* Spending overview */}
        <SectionHeader title="Spending Overview" actionLabel={format(new Date(), 'MMMM')} />
        <Card>
          {infoQ.loading ? (
            <Loader size="small" />
          ) : segments.length === 0 ? (
            <EmptyState icon="chart-pie" title="No spending yet" subtitle="Your expenses this month will appear here." />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              <DonutChart
                segments={segments}
                centerLabel="Spent"
                centerValue={formatMoney(expense, user?.currency)}
              />
              <View style={{ flex: 1, gap: 12 }}>
                {topSlices.map((s, i) => (
                  <View key={s.category} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 11, height: 11, borderRadius: 4, backgroundColor: colors.chart[i % colors.chart.length] }} />
                    <AppText size={13} weight="semibold" color={colors.heading} style={{ flex: 1 }} numberOfLines={1}>
                      {categoryLabel(s.category)}
                    </AppText>
                    <AppText size={13} weight="bold" color={colors.muted}>
                      {Math.round(s.pct * 100)}%
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* Recent activity */}
        <SectionHeader title="Recent Activity" actionLabel="See all" onAction={() => router.push('/(tabs)/transactions')} />
        {recentQ.loading ? (
          <Loader size="small" />
        ) : recent.length === 0 ? (
          <EmptyState icon="activity" title="No transactions yet" subtitle="Tap + to record your first transaction." />
        ) : (
          <View style={{ gap: 11 }}>
            {recent.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                currency={user?.currency}
                onPress={() => {
                  setEditingTx(t)
                  router.push({ pathname: '/transaction/[id]', params: { id: String(t.id) } })
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function HeroChip({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 16, padding: 13 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 22, height: 22, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={13} color="#fff" />
        </View>
        <AppText size={11.5} color="rgba(255,255,255,0.9)" weight="semibold">
          {label}
        </AppText>
      </View>
      <AppText weight="extrabold" size={17} color="#fff" style={{ marginTop: 6 }}>
        {value}
      </AppText>
    </View>
  )
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 14 }}>
      <AppText variant="heading" size={17} color={colors.heading}>
        {title}
      </AppText>
      {actionLabel ? (
        <Pressable onPress={onAction}>
          <AppText size={13} weight="bold" color={colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  )
}
