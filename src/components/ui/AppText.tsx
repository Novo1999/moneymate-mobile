import { useTheme } from '@/theme/ThemeProvider'
import { Text, type TextProps } from 'react-native'

type Variant = 'heading' | 'body'
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold'

export type AppTextProps = TextProps & {
  variant?: Variant
  weight?: Weight
  size?: number
  color?: string
  lineHeight?: number
  letterSpacing?: number
}

export function AppText({
  variant = 'body',
  weight = 'regular',
  size = 14,
  color,
  lineHeight,
  letterSpacing = -0.2,
  style,
  ...rest
}: AppTextProps) {
  const { colors, fonts } = useTheme()

  const fontFamily =
    variant === 'heading' || weight === 'extrabold'
      ? fonts.heading
      : weight === 'bold'
        ? fonts.bold
        : weight === 'semibold'
          ? fonts.semibold
          : weight === 'medium'
            ? fonts.medium
            : fonts.body

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: size,
          color: color ?? colors.text,
          letterSpacing,
          ...(lineHeight ? { lineHeight } : {}),
        },
        style,
      ]}
      {...rest}
    />
  )
}
