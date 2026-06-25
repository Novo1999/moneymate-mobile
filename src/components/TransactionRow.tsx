import { categoryEmoji, categoryLabel } from '@/constants/categories'
import { AppText } from '@/components/ui/AppText'
import { formatSignedMoney, formatTxDate } from '@/lib/format'
import { useTheme } from '@/theme/ThemeProvider'
import type { Transaction } from '@/types/models'
import { Pressable, View } from 'react-native'

export function TransactionRow({
  transaction,
  currency,
  onPress,
  showDate = true,
}: {
  transaction: Transaction
  currency?: string
  onPress?: () => void
  showDate?: boolean
}) {
  const { colors, radii, shadow, mode } = useTheme()
  const isIncome = transaction.type === 'income'

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 13,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: 13,
          opacity: pressed ? 0.9 : 1,
        },
        mode === 'light' ? shadow.sm : null,
      ]}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: radii.md,
          backgroundColor: colors.primarySoftBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText size={22}>{categoryEmoji(transaction.category)}</AppText>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="bold" size={15} color={colors.heading} numberOfLines={1}>
          {categoryLabel(transaction.category)}
        </AppText>
        {showDate ? (
          <AppText size={12} color={colors.mutedSoft} style={{ marginTop: 2 }}>
            {formatTxDate(transaction.createdAt)}
          </AppText>
        ) : transaction.note ? (
          <AppText size={12} color={colors.mutedSoft} style={{ marginTop: 2 }} numberOfLines={1}>
            {transaction.note}
          </AppText>
        ) : null}
      </View>

      <AppText weight="extrabold" size={15} color={isIncome ? colors.income : colors.danger}>
        {formatSignedMoney(transaction.money, transaction.type, currency)}
      </AppText>
    </Pressable>
  )
}
