import { Icon } from '@/components/Icon'
import { AppText, ConfirmSheet, IconButton } from '@/components/ui'
import { EmptyState, Loader } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { deleteCategory, listCategories } from '@/lib/api/category'
import { dataVersionAtom } from '@/state/atoms'
import { useTheme } from '@/theme/ThemeProvider'
import type { Category } from '@/types/models'
import { useRouter } from 'expo-router'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CategoriesScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const dataVersion = useAtomValue(dataVersionAtom)
  const categoriesQ = useAsync(() => listCategories(), [dataVersion])

  const { income, expense } = useMemo(() => {
    const all = categoriesQ.data ?? []
    return {
      income: all.filter((c) => c.type === 'income'),
      expense: all.filter((c) => c.type === 'expense'),
    }
  }, [categoriesQ.data])

  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const onDelete = (cat: Category) => {
    if (!cat.id) return
    setToDelete(cat)
  }

  const confirmDelete = async () => {
    if (!toDelete?.id) return
    setDeleting(true)
    try {
      await deleteCategory(toDelete.id)
      categoriesQ.reload()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const Section = ({ title, items }: { title: string; items: Category[] }) =>
    items.length === 0 ? null : (
      <>
        <AppText weight="bold" size={12} color={colors.mutedSoft} style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 22, marginBottom: 12, marginLeft: 2 }}>
          {title}
        </AppText>
        <View style={{ gap: 11 }}>
          {items.map((c) => (
            <View
              key={c.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 13 }}
            >
              <View style={{ width: 46, height: 46, borderRadius: radii.md, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' }}>
                <AppText size={22}>{c.icon || '🏷️'}</AppText>
              </View>
              <AppText weight="bold" size={15} color={colors.heading} style={{ flex: 1 }}>
                {c.name}
              </AppText>
              <Pressable onPress={() => onDelete(c)} hitSlop={8} style={{ padding: 6 }}>
                <Icon name="trash" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      </>
    )

  const isEmpty = (categoriesQ.data ?? []).length === 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconButton name="chevron-left" onPress={() => router.back()} />
          <AppText variant="heading" size={22} color={colors.heading}>
            Categories
          </AppText>
        </View>
        <IconButton name="plus" color="#fff" onPress={() => router.push('/category/new')} style={{ backgroundColor: colors.primary, borderColor: colors.primary }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}>
        {categoriesQ.loading ? (
          <Loader />
        ) : isEmpty ? (
          <EmptyState icon="tag" title="No custom categories" subtitle="Create your own categories to organise transactions your way." />
        ) : (
          <>
            <Section title="Expense" items={expense} />
            <Section title="Income" items={income} />
          </>
        )}
      </ScrollView>

      <ConfirmSheet
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete category?"
        message={`"${toDelete?.name ?? ''}" will be removed from your categories.`}
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  )
}
