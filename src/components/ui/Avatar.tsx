import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

export function Avatar({
  name,
  uri,
  size = 44,
  radius = 14,
}: {
  name?: string | null
  /** Hosted profile picture URL — falls back to the initial when absent. */
  uri?: string | null
  size?: number
  radius?: number
}) {
  const { colors } = useTheme()
  const initial = (name?.trim()?.[0] ?? 'U').toUpperCase()

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.surface }}
        contentFit="cover"
        transition={150}
      />
    )
  }

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: radius, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText weight="extrabold" size={size * 0.38} color="#fff">
        {initial}
      </AppText>
    </LinearGradient>
  )
}
