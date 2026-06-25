import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import { AppText } from './AppText'

type FieldProps = TextInputProps & {
  label?: string
  icon?: IconName
  secure?: boolean
  error?: string
}

export function Field({ label, icon, secure = false, error, style, ...rest }: FieldProps) {
  const { colors, radii, fonts } = useTheme()
  const [hidden, setHidden] = useState(secure)
  const [focused, setFocused] = useState(false)

  return (
    <View>
      {label ? (
        <AppText weight="semibold" size={12} color={colors.muted} style={{ marginBottom: 8, marginLeft: 2 }}>
          {label}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.inputBg,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
          borderRadius: radii.md,
          paddingHorizontal: 14,
          paddingVertical: 14,
        }}
      >
        {icon ? <Icon name={icon} size={18} color={focused ? colors.primary : colors.mutedSoft} /> : null}
        <TextInput
          style={[{ flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.text, padding: 0 }, style]}
          placeholderTextColor={colors.mutedSoft}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.mutedSoft} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText size={12} color={colors.danger} style={{ marginTop: 6, marginLeft: 2 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  )
}
