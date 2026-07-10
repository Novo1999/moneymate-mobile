import { useTheme } from '@/theme/ThemeProvider'
import { TextInput, View } from 'react-native'
import { AppText } from './AppText'

type AmountInputProps = {
  /** Currency symbol rendered before the number. */
  symbol: string
  value: string
  onChangeText: (value: string) => void
  /** Tint for symbol + digits (e.g. income green / expense red). Defaults to primary. */
  color?: string
}

/**
 * Big borderless amount input (symbol + digits) for the transaction & transfer forms —
 * unlike `Field` it has no boxed chrome. Strips non-numeric characters as you type.
 */
export function AmountInput({ symbol, value, onChangeText, color }: AmountInputProps) {
  const { colors, fonts } = useTheme()
  const tint = color ?? colors.primary

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
      <AppText variant="heading" size={30} color={tint}>
        {symbol}
      </AppText>
      <TextInput
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/[^0-9.]/g, ''))}
        placeholder="0.00"
        placeholderTextColor={colors.mutedSoft}
        keyboardType="decimal-pad"
        style={{
          fontFamily: fonts.heading,
          fontSize: 40,
          color: tint,
          padding: 0,
          minWidth: 90,
          textAlign: 'center',
        }}
      />
    </View>
  )
}
