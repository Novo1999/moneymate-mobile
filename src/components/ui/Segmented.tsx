import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { Pressable, View } from 'react-native'
import { AppText } from './AppText'

export type SegmentOption<T extends string> = { value: T; label: string; icon?: IconName }

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  activeColor,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  activeColor?: string
}) {
  const { colors, radii } = useTheme()
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.segmentBg, borderRadius: radii.md, padding: 5 }}>
      {options.map((opt) => {
        const active = opt.value === value
        const bg = active ? activeColor ?? colors.segmentActiveBg : 'transparent'
        const fg = active ? (activeColor ? '#fff' : colors.segmentActiveText) : colors.muted
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              paddingVertical: 11,
              borderRadius: radii.sm,
              backgroundColor: bg,
            }}
          >
            {opt.icon ? <Icon name={opt.icon} size={15} color={fg} /> : null}
            <AppText weight="bold" size={13.5} color={fg}>
              {opt.label}
            </AppText>
          </Pressable>
        )
      })}
    </View>
  )
}
