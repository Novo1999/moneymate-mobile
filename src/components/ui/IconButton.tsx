import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { Pressable, View, type ViewStyle } from 'react-native'

export function IconButton({
  name,
  onPress,
  size = 20,
  color,
  badge = false,
  style,
}: {
  name: IconName
  onPress?: () => void
  size?: number
  color?: string
  badge?: boolean
  style?: ViewStyle
}) {
  const { colors, radii, shadow, mode } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: radii.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        },
        mode === 'light' ? shadow.sm : null,
        style,
      ]}
    >
      <Icon name={name} size={size} color={color ?? colors.primary} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 11,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: colors.danger,
            borderWidth: 2,
            borderColor: colors.surface,
          }}
        />
      ) : null}
    </Pressable>
  )
}
