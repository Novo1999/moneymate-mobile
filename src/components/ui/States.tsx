import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'
import { ActivityIndicator, View } from 'react-native'

export function Loader({ size = 'large' }: { size?: 'small' | 'large' }) {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  )
}

export function EmptyState({ icon = 'info', title, subtitle }: { icon?: IconName; title: string; subtitle?: string }) {
  const { colors, radii } = useTheme()
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 24 }}>
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: radii.xl,
          backgroundColor: colors.primarySoftBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon name={icon} size={30} color={colors.primary} />
      </View>
      <AppText weight="bold" size={16} color={colors.heading} style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText size={13.5} color={colors.muted} style={{ textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  )
}
