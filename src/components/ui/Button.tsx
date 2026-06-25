import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native'
import { AppText } from './AppText'

type Variant = 'primary' | 'outline' | 'danger' | 'soft' | 'ghost'

type ButtonProps = {
  title: string
  onPress?: () => void
  variant?: Variant
  icon?: IconName
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  size?: number
  fullWidth?: boolean
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  size = 15,
  fullWidth = true,
}: ButtonProps) {
  const { colors, radii } = useTheme()

  const base: ViewStyle = {
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: fullWidth ? '100%' : undefined,
  }

  const textColor =
    variant === 'primary'
      ? colors.onPrimary
      : variant === 'danger'
        ? colors.danger
        : variant === 'soft'
          ? colors.primary
          : colors.text

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Icon name={icon} size={18} color={textColor} /> : null}
          <AppText weight="bold" size={size} color={textColor}>
            {title}
          </AppText>
        </View>
      )}
    </>
  )

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.9 : 1, borderRadius: radii.lg, width: fullWidth ? '100%' : undefined }, style]}
      >
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={base}
        >
          {content}
        </LinearGradient>
      </Pressable>
    )
  }

  const variantStyle: ViewStyle =
    variant === 'danger'
      ? { backgroundColor: colors.dangerSoftBg, borderWidth: 1, borderColor: colors.dangerBorder }
      : variant === 'soft'
        ? { backgroundColor: colors.primarySoftBg }
        : variant === 'ghost'
          ? { backgroundColor: 'transparent' }
          : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong }

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [base, variantStyle, { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}
    >
      {content}
    </Pressable>
  )
}
