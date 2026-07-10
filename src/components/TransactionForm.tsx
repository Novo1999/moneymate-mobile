import { Icon } from '@/components/Icon'
import { ModalHeader } from '@/components/ModalHeader'
import { AmountInput, AppText, Button, ConfirmSheet, Field } from '@/components/ui'
import { Loader } from '@/components/ui/States'
import { categoriesForKind, categoryEmoji, categoryLabel } from '@/constants/categories'
import { currencySymbol } from '@/constants/currency'
import { useAsync } from '@/hooks/useAsync'
import { listAccounts } from '@/lib/api/accountType'
import { addTransaction, deleteTransaction, editTransaction } from '@/lib/api/transaction'
import { ApiError } from '@/lib/api/client'
import { dataVersionAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import type { Transaction, TransactionKind } from '@/types/models'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { Platform, Pressable, ScrollView, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { SafeAreaView } from 'react-native-safe-area-context'

export function TransactionForm({ existing }: { existing?: Transaction }) {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const { user, activeAccountId } = useAuth()
  const bumpData = useSetAtom(dataVersionAtom)
  const isEdit = !!existing

  const accountsQ = useAsync(() => listAccounts(), [])
  const accounts = accountsQ.data ?? []

  const [type, setType] = useState<TransactionKind>(existing?.type ?? 'expense')
  const [amount, setAmount] = useState(existing ? String(Number(existing.money)) : '')
  const [category, setCategory] = useState<string>(existing?.category ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [accountId, setAccountId] = useState<number | null>(activeAccountId ?? null)
  const [date, setDate] = useState<Date>(existing ? new Date(existing.createdAt) : new Date())
  const [showPicker, setShowPicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // measured width of the category grid → exact cell size for 4 fluid columns
  const [gridWidth, setGridWidth] = useState(0)

  const categories = categoriesForKind(type)
  const typeColor = type === 'income' ? colors.income : colors.danger

  const onChangeType = (next: TransactionKind) => {
    setType(next)
    setCategory('') // category sets differ per type
  }

  const submit = async () => {
    setError(null)
    const money = Number(amount)
    if (!money || money <= 0) return setError('Enter an amount greater than 0')
    if (!category) return setError('Pick a category')
    if (!isEdit && (!accountId || !user?.id)) return setError('Select an account')

    setSubmitting(true)
    try {
      if (isEdit && existing) {
        await editTransaction(existing.id, { category, money, type, createdAt: date.toISOString(), note })
      } else {
        await addTransaction({
          category,
          money,
          type,
          userId: user!.id,
          accountTypeId: accountId!,
          createdAt: date.toISOString(),
          note: note || undefined,
        })
      }
      bumpData((v) => v + 1)
      router.back()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!existing) return
    setDeleting(true)
    try {
      await deleteTransaction(existing.id)
      bumpData((v) => v + 1)
      setDeleteOpen(false)
      router.back()
    } catch (e) {
      setDeleteOpen(false)
      setError(e instanceof ApiError ? e.message : 'Failed to delete')
    } finally {
      setDeleting(false)
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
        <ModalHeader title={isEdit ? 'Edit Transaction' : 'New Transaction'} />

        {/* type toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: colors.segmentBg, borderRadius: radii.md, padding: 5, marginBottom: 20 }}>
          {(['expense', 'income'] as const).map((t) => {
            const active = type === t
            const bg = active ? (t === 'income' ? colors.income : colors.danger) : 'transparent'
            return (
              <Pressable
                key={t}
                onPress={() => onChangeType(t)}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: radii.sm, backgroundColor: bg }}
              >
                <Icon name={t === 'income' ? 'arrow-up' : 'arrow-down'} size={15} color={active ? '#fff' : colors.muted} />
                <AppText weight="bold" size={13.5} color={active ? '#fff' : colors.muted}>
                  {t === 'income' ? 'Income' : 'Expense'}
                </AppText>
              </Pressable>
            )
          })}
        </View>

        {/* amount */}
        <View style={{ alignItems: 'center', marginBottom: 22 }}>
          <AppText size={13} color={colors.muted} weight="semibold">
            Amount
          </AppText>
          <AmountInput symbol={currencySymbol(user?.currency)} value={amount} onChangeText={setAmount} color={typeColor} />
        </View>

        {/* category grid */}
        <AppText weight="bold" size={13} color={colors.muted} style={{ marginBottom: 12, marginLeft: 2 }}>
          Category
        </AppText>
        <View
          onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}
        >
          {categories.map((c) => {
            const selected = category === c
            // 4 equal columns filling the measured row; tiles stay square and uniform on the last row
            const cellWidth = gridWidth ? Math.floor((gridWidth - 3 * 12) / 4) : 52
            const tile = { width: '100%', aspectRatio: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' } as const
            return (
              <Pressable key={c} onPress={() => setCategory(c)} style={{ width: cellWidth, alignItems: 'center', gap: 5 }}>
                {selected ? (
                  <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tile}>
                    <AppText size={22}>{categoryEmoji(c)}</AppText>
                  </LinearGradient>
                ) : (
                  <View style={[tile, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                    <AppText size={22}>{categoryEmoji(c)}</AppText>
                  </View>
                )}
                <AppText size={10} weight="medium" color={selected ? colors.primary : colors.mutedSoft} numberOfLines={1} style={{ textAlign: 'center' }}>
                  {categoryLabel(c)}
                </AppText>
              </Pressable>
            )
          })}
        </View>

        {/* account selector (create only) */}
        {!isEdit ? (
          <>
            <AppText weight="bold" size={13} color={colors.muted} style={{ marginBottom: 12, marginLeft: 2 }}>
              Account
            </AppText>
            {accountsQ.loading ? (
              <Loader size="small" />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginBottom: 22 }}>
                {accounts.map((a) => {
                  const selected = a.id === accountId
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => setAccountId(a.id)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                        borderRadius: radii.md,
                        backgroundColor: selected ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <AppText weight="bold" size={13} color={selected ? '#fff' : colors.heading}>
                        {a.name}
                      </AppText>
                      <AppText size={11} color={selected ? 'rgba(255,255,255,0.85)' : colors.mutedSoft} style={{ marginTop: 2 }}>
                        {currencySymbol(user?.currency)}
                        {Number(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </AppText>
                    </Pressable>
                  )
                })}
              </ScrollView>
            )}
          </>
        ) : null}

        {/* date */}
        <AppText weight="bold" size={13} color={colors.muted} style={{ marginBottom: 12, marginLeft: 2 }}>
          Date
        </AppText>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 15, paddingVertical: 15, marginBottom: 16 }}
        >
          <Icon name="calendar" size={18} color={colors.primary} />
          <AppText size={14} weight="semibold" color={colors.heading} style={{ flex: 1 }}>
            {format(date, 'EEE, d MMM yyyy · h:mm a')}
          </AppText>
          <Icon name="chevron-right" size={18} color={colors.tabInactive} />
        </Pressable>
        {showPicker ? (
          <DateTimePicker
            value={date}
            mode="date"
            maximumDate={new Date()}
            onValueChange={(_, selected) => {
              // Android's dialog closes itself after a pick; iOS shows an inline picker that stays.
              setShowPicker(Platform.OS === 'ios')
              setDate(selected)
            }}
            onDismiss={() => setShowPicker(false)}
          />
        ) : null}

        {/* note */}
        <Field label="Note (optional)" placeholder="Add a note" value={note ?? ''} onChangeText={setNote} autoCapitalize="sentences" />

        {error ? (
          <View style={{ marginTop: 14, backgroundColor: colors.dangerSoftBg, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.dangerBorder }}>
            <AppText size={12.5} color={colors.danger} style={{ textAlign: 'center' }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button title={isEdit ? 'Save changes' : 'Save transaction'} onPress={submit} loading={submitting} style={{ marginTop: 20 }} />

        {isEdit ? (
          <Button title="Delete transaction" variant="danger" icon="trash" onPress={() => setDeleteOpen(true)} style={{ marginTop: 12 }} />
        ) : null}
      </KeyboardAwareScrollView>

      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete transaction?"
        message="This will permanently remove this transaction and adjust your balance."
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  )
}
