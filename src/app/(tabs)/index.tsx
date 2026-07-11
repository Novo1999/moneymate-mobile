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
import { addMonths, endOfMonth, format, isAfter, startOfMonth, subMonths } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Pressable, RefreshControl, ScrollView, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'

const SWIPE_THRESHOLD = 72

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen() {
  const { colors, radii } = useTheme()
  const { push } = useRouter()
  const { user, activeAccountId, setActiveAccount } = useAuth()
  const dataVersion = useAtomValue(dataVersionAtom)
  const setEditingTx = useSetAtom(editingTransactionAtom)

  // Month shown in the spending overview — steppable like the web app's DateController.
  const [monthDate, setMonthDate] = useState(() => new Date())
  const canGoForward = !isAfter(startOfMonth(addMonths(monthDate, 1)), startOfMonth(new Date()))
  const { from, to } = useMemo(
    () => ({ from: startOfMonth(monthDate).toISOString(), to: endOfMonth(monthDate).toISOString() }),
    [monthDate],
  )

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
  const monthTx = useMemo(() => infoQ.data?.transactions ?? [], [infoQ.data])
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

  const { width: screenWidth } = useWindowDimensions()
  const canSwipeAccounts = accounts.length > 1
  const heroTranslateX = useSharedValue(0)

  // Called once the old card has fully slid out to the left: swap the account,
  // park the card off-screen right, and slide it back in carousel-style.
  const switchToNextAccount = () => {
    if (!canSwipeAccounts) return
    const idx = accounts.findIndex((a) => a.id === activeAccount?.id)
    const next = accounts[(idx + 1) % accounts.length]
    setActiveAccount(next.id)
    heroTranslateX.set(screenWidth)
    heroTranslateX.set(withTiming(0, { duration: 280 }))
  }

  const heroPan = Gesture.Pan()
    .enabled(canSwipeAccounts)
    .activeOffsetX(-16)
    .failOffsetY([-14, 14])
    .onUpdate((e) => {
      // Track the finger going left; rubber-band slightly on rightward drags.
      heroTranslateX.set(e.translationX < 0 ? e.translationX : e.translationX * 0.12)
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        heroTranslateX.set(
          withTiming(-screenWidth, { duration: 200 }, (finished) => {
            if (finished) scheduleOnRN(switchToNextAccount)
          }),
        )
      } else {
        heroTranslateX.set(withSpring(0, { damping: 18, stiffness: 220 }))
      }
    })
  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: heroTranslateX.get() }],
    opacity: 1 - Math.min(1, Math.abs(heroTranslateX.get()) / screenWidth) * 0.5,
  }))

  const quickActions: { icon: IconName; label: string; onPress: () => void; primary?: boolean }[] = [
    { icon: 'plus', label: 'Add', onPress: () => push('/transaction/new'), primary: true },
    { icon: 'transfer', label: 'Transfer', onPress: () => push('/account/transfer') },
    { icon: 'tag', label: 'Categories', onPress: () => push('/categories') },
    { icon: 'chart-pie', label: 'Accounts', onPress: () => push('/(tabs)/accounts') },
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

        {/* Balance hero — swipe left to switch the active account */}
        <GestureDetector gesture={heroPan}>
          <Animated.View style={heroStyle}>
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

              {canSwipeAccounts ? <SwipeHint /> : null}
            </LinearGradient>
          </Animated.View>
        </GestureDetector>

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
        <SectionHeader
          title="Spending Overview"
          action={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Pressable onPress={() => setMonthDate((d) => subMonths(d, 1))} hitSlop={10}>
                <Icon name="chevron-left" size={17} color={colors.primary} />
              </Pressable>
              <AppText size={13} weight="bold" color={colors.primary}>
                {format(monthDate, 'MMMM yyyy')}
              </AppText>
              <Pressable onPress={() => setMonthDate((d) => addMonths(d, 1))} hitSlop={10} disabled={!canGoForward}>
                <Icon name="chevron-right" size={17} color={canGoForward ? colors.primary : colors.mutedSoft} />
              </Pressable>
            </View>
          }
        />
        <Card>
          {infoQ.loading ? (
            <Loader size="small" />
          ) : segments.length === 0 ? (
            <EmptyState
              icon="chart-pie"
              title="No spending yet"
              subtitle={`Your expenses for ${format(monthDate, 'MMMM')} will appear here.`}
            />
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
        <SectionHeader title="Recent Activity" actionLabel="See all" onAction={() => push('/(tabs)/transactions')} />
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
                  push({ pathname: '/transaction/[id]', params: { id: String(t.id) } })
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/** Subtle pulsing hint shown on the hero card when more than one account exists. */
function SwipeHint() {
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.set(
      withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })), -1),
    )
  }, [pulse])

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.get() * 0.65,
    transform: [{ translateX: pulse.get() * -3 }],
  }))

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 16 }}>
      <Animated.View style={arrowStyle}>
        <Icon name="chevron-left" size={12} color="rgba(255,255,255,0.9)" />
      </Animated.View>
      <AppText size={11} color="rgba(255,255,255,0.7)" weight="medium">
        Swipe left to switch account
      </AppText>
    </View>
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

function SectionHeader({
  title,
  actionLabel,
  onAction,
  action,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
  action?: ReactNode
}) {
  const { colors } = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 14 }}>
      <AppText variant="heading" size={17} color={colors.heading}>
        {title}
      </AppText>
      {action ??
        (actionLabel ? (
          <Pressable onPress={onAction}>
            <AppText size={13} weight="bold" color={colors.primary}>
              {actionLabel}
            </AppText>
          </Pressable>
        ) : null)}
    </View>
  )
}
