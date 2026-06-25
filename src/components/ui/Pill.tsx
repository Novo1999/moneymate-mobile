import { useTheme } from '@/theme/ThemeProvider'
import { LinearGradient } from 'expo-linear-gradient'
import { Pressable } from 'react-native'
import { AppText } from './AppText'

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { colors, radii } = useTheme()

  if (active) {
    return (
      <Pressable onPress={onPress}>
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: radii.pill }}
        >
          <AppText weight="bold" size={13} color="#fff">
            {label}
          </AppText>
        </LinearGradient>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: radii.pill,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <AppText weight="semibold" size={13} color={colors.muted}>
        {label}
      </AppText>
    </Pressable>
  )
}
