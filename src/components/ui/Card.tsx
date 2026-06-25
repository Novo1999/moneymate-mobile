import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { Pressable, View, type ViewStyle } from 'react-native'

export function Card({
  children,
  style,
  padding = 16,
  elevated = true,
  onPress,
}: {
  children: ReactNode
  style?: ViewStyle
  padding?: number
  elevated?: boolean
  onPress?: () => void
}) {
  const { colors, radii, shadow, mode } = useTheme()
  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding,
  }
  const elevation = elevated && mode === 'light' ? shadow.sm : null

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, elevation, { opacity: pressed ? 0.92 : 1 }, style]}>
        {children}
      </Pressable>
    )
  }
  return <View style={[cardStyle, elevation, style]}>{children}</View>
}
