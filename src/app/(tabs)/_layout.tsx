import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs, useRouter } from 'expo-router'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Minimal shape of the props expo-router passes to a custom tabBar.
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] }
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean }
    navigate: (name: string) => void
  }
}

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'transactions', label: 'Transactions', icon: 'transactions' },
  { name: 'accounts', label: 'Accounts', icon: 'wallet' },
  { name: 'profile', label: 'Profile', icon: 'profile' },
]

function TabBar({ state, navigation }: TabBarProps) {
  const { colors, radii } = useTheme()
  const insets = useSafeAreaInsets()
  const { push } = useRouter()

  // Split tabs around the central FAB (2 left, 2 right).
  const left = TABS.slice(0, 2)
  const right = TABS.slice(2)

  const renderTab = (tab: (typeof TABS)[number]) => {
    const routeIndex = state.routes.findIndex((r: { name: string }) => r.name === tab.name)
    const focused = state.index === routeIndex
    return (
      <Pressable
        key={tab.name}
        onPress={() => {
          const route = state.routes[routeIndex]
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
        }}
        style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 }}
      >
        <Icon name={tab.icon} size={23} color={focused ? colors.primary : colors.tabInactive} />
        <AppText weight={focused ? 'bold' : 'medium'} size={10} color={focused ? colors.primary : colors.tabInactive}>
          {tab.label}
        </AppText>
      </Pressable>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingHorizontal: 8,
      }}
    >
      {left.map(renderTab)}

      <View style={{ width: 72, alignItems: 'center' }}>
        <Pressable onPress={() => push('/transaction/new')} style={{ marginTop: -30 }}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: radii.xl,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 4,
              borderColor: colors.screen,
            }}
          >
            <Icon name="plus" size={28} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      {right.map(renderTab)}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="accounts" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
