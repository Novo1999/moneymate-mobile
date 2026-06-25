import { TransactionRow } from '@/components/TransactionRow'
import { AppText, Pill } from '@/components/ui'
import { EmptyState, Loader } from '@/components/ui/States'
import { categoriesForKind, categoryLabel } from '@/constants/categories'
import { getTransactionsPaginated } from '@/lib/api/transaction'
import { dayGroupLabel, dayKey } from '@/lib/format'
import { dataVersionAtom, editingTransactionAtom, txFilterAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import type { Transaction, TransactionKind } from '@/types/models'
import { useRouter } from 'expo-router'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, SectionList, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const PAGE_SIZE = 15

export default function TransactionsScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { user, activeAccountId } = useAuth()
  const dataVersion = useAtomValue(dataVersionAtom)
  const [filter, setFilter] = useAtom(txFilterAtom)
  const setEditingTx = useSetAtom(editingTransactionAtom)

  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const reqId = useRef(0)

  const typeFilter = filter.type ?? ''
  const categoryFilter = filter.category ?? ''

  const fetchPage = useCallback(
    async (nextCursor: number, replace: boolean) => {
      if (!activeAccountId) return
      const id = ++reqId.current
      if (replace) setLoading(true)
      else setLoadingMore(true)
      try {
        const page = await getTransactionsPaginated(activeAccountId, nextCursor, PAGE_SIZE, filter)
        if (id !== reqId.current) return
        const incoming = page?.transactions ?? []
        setItems((prev) => (replace ? incoming : [...prev, ...incoming]))
        setCursor(page?.nextCursor ?? 0)
        setHasMore(Boolean(page?.nextCursor))
      } catch {
        if (id === reqId.current && replace) setItems([])
      } finally {
        if (id === reqId.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [activeAccountId, filter],
  )

  useEffect(() => {
    fetchPage(0, true)
  }, [fetchPage, dataVersion])

  const loadMore = () => {
    if (!loadingMore && hasMore && cursor) fetchPage(cursor, false)
  }

  const sections = useMemo(() => groupByDay(items), [items])

  const categoryOptions = useMemo(() => {
    if (typeFilter === 'income') return categoriesForKind('income')
    if (typeFilter === 'expense') return categoriesForKind('expense')
    return [...categoriesForKind('expense'), ...categoriesForKind('income')]
  }, [typeFilter])

  const setType = (type: TransactionKind | '') => setFilter((f) => ({ ...f, type, category: '' }))
  const setCategory = (category: string) => setFilter((f) => ({ ...f, category: f.category === category ? '' : category }))

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <AppText variant="heading" size={24} color={colors.heading} style={{ marginBottom: 16 }}>
          Transactions
        </AppText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
          <Pill label="All" active={typeFilter === ''} onPress={() => setType('')} />
          <Pill label="Income" active={typeFilter === 'income'} onPress={() => setType('income')} />
          <Pill label="Expense" active={typeFilter === 'expense'} onPress={() => setType('expense')} />
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 6 }}>
          {categoryOptions.map((c) => (
            <Pill key={c} label={categoryLabel(c)} active={categoryFilter === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState icon="activity" title="No transactions found" subtitle="Try a different filter, or add a new transaction." />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderSectionHeader={({ section }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 }}>
              <AppText weight="bold" size={12} color={colors.mutedSoft} style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {section.title}
              </AppText>
              <AppText weight="bold" size={12} color={section.net >= 0 ? colors.income : colors.danger}>
                {section.net >= 0 ? '+' : '−'}
                {Math.abs(section.net).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 11 }}>
              <TransactionRow
                transaction={item}
                currency={user?.currency}
                showDate={false}
                onPress={() => {
                  setEditingTx(item)
                  router.push({ pathname: '/transaction/[id]', params: { id: String(item.id) } })
                }}
              />
            </View>
          )}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null}
        />
      )}
    </SafeAreaView>
  )
}

type DaySection = { title: string; net: number; data: Transaction[] }

function groupByDay(items: Transaction[]): DaySection[] {
  const map = new Map<string, DaySection>()
  const order: string[] = []
  for (const t of items) {
    const key = dayKey(t.createdAt)
    if (!map.has(key)) {
      map.set(key, { title: dayGroupLabel(t.createdAt), net: 0, data: [] })
      order.push(key)
    }
    const section = map.get(key)!
    section.data.push(t)
    section.net += (t.type === 'income' ? 1 : -1) * (Number(t.money) || 0)
  }
  return order.map((k) => map.get(k)!)
}
