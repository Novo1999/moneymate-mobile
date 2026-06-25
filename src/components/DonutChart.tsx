import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'

export type DonutSegment = { value: number; color: string }

export function DonutChart({
  segments,
  size = 132,
  thickness = 18,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerValue?: string
}) {
  const { colors } = useTheme()
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  let offset = 0
  const arcs =
    total > 0
      ? segments
          .filter((s) => s.value > 0)
          .map((s, i) => {
            const fraction = s.value / total
            const dash = fraction * circumference
            const arc = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                fill="transparent"
              />
            )
            offset += dash
            return arc
          })
      : []

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.segmentBg}
            strokeWidth={thickness}
            fill="transparent"
          />
          {arcs}
        </G>
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        {centerLabel ? (
          <AppText size={11} weight="semibold" color={colors.muted}>
            {centerLabel}
          </AppText>
        ) : null}
        {centerValue ? (
          <AppText size={18} weight="extrabold" color={colors.heading}>
            {centerValue}
          </AppText>
        ) : null}
      </View>
    </View>
  )
}
