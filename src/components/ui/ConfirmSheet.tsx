import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'
import { AppText } from './AppText'
import { Button } from './Button'
import { Sheet } from './Sheet'

type ConfirmSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  message: string
  /** Icon in the danger badge; also the confirm button's icon unless confirmIcon is set. */
  icon?: IconName
  confirmLabel?: string
  confirmIcon?: IconName
  /** Shows a spinner on confirm and blocks dismissal while true. */
  loading?: boolean
  onConfirm: () => void
}

/** Destructive-action confirmation bottom sheet (log out, deletes). */
export function ConfirmSheet({
  open,
  onClose,
  title,
  message,
  icon = 'trash',
  confirmLabel = 'Delete',
  confirmIcon,
  loading = false,
  onConfirm,
}: ConfirmSheetProps) {
  const { colors, radii } = useTheme()

  return (
    <Sheet open={open} onClose={onClose} dismissable={!loading}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radii.lg,
          backgroundColor: colors.dangerSoftBg,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 14,
        }}
      >
        <Icon name={icon} size={26} color={colors.danger} />
      </View>
      <AppText variant="heading" size={18} color={colors.heading} style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText size={13.5} color={colors.muted} style={{ textAlign: 'center', marginTop: 6, marginBottom: 20, lineHeight: 19 }}>
        {message}
      </AppText>
      <Button title={confirmLabel} variant="danger" icon={confirmIcon ?? icon} onPress={onConfirm} loading={loading} />
      <Button title="Cancel" variant="ghost" onPress={onClose} disabled={loading} style={{ marginTop: 8 }} />
    </Sheet>
  )
}
