import { Icon } from '@/components/Icon'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'
import { useRouter } from 'expo-router'
import { Pressable, View } from 'react-native'

export function ModalHeader({ title }: { title: string }) {
  const { colors, radii } = useTheme()
  const router = useRouter()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, marginBottom: 8 }}>
      <View style={{ width: 40 }} />
      <AppText variant="heading" size={18} color={colors.heading}>
        {title}
      </AppText>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={{ width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.segmentBg, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="close" size={20} color={colors.muted} />
      </Pressable>
    </View>
  )
}
