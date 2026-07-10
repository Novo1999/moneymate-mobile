import { Icon, type IconName } from '@/components/Icon'
import { AppText, Avatar, Button, ConfirmSheet, Pill, Sheet } from '@/components/ui'
import { currencySymbol, POPULAR_CURRENCIES } from '@/constants/currency'
import { useTheme } from '@/theme/ThemeProvider'
import { useAuth } from '@/state/auth'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Switch, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProfileScreen() {
  const { colors, mode, setPreference } = useTheme()
  const router = useRouter()
  const { user, logout, updateUser } = useAuth()
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const isDark = mode === 'dark'

  const pickCurrency = async (code: string) => {
    setSavingCurrency(true)
    try {
      await updateUser({ currency: code })
    } finally {
      setSavingCurrency(false)
      setCurrencyOpen(false)
    }
  }

  const confirmLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
      setLogoutOpen(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}>
        {/* Profile header */}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 24 }}>
          <Avatar name={user?.name} size={84} radius={28} />
          <AppText variant="heading" size={20} color={colors.heading} style={{ marginTop: 14 }}>
            {user?.name ?? 'MoneyMate user'}
          </AppText>
          <AppText size={13.5} color={colors.muted} style={{ marginTop: 2 }}>
            {user?.email}
          </AppText>
        </View>

        <GroupLabel>Preferences</GroupLabel>
        <Group>
          <Row
            icon="currency"
            label="Currency"
            value={`${user?.currency ?? 'USD'} ${currencySymbol(user?.currency)}`}
            onPress={() => setCurrencyOpen(true)}
            first
          />
          <Row
            icon="moon"
            label="Dark mode"
            right={
              <Switch
                value={isDark}
                onValueChange={(v) => setPreference(v ? 'dark' : 'light')}
                trackColor={{ true: colors.primary, false: colors.segmentBg }}
                thumbColor="#fff"
              />
            }
            last
          />
        </Group>

        <GroupLabel>Manage</GroupLabel>
        <Group>
          <Row icon="tag" label="Categories" onPress={() => router.push('/categories')} first chevron />
          <Row icon="cards" label="Accounts" onPress={() => router.push('/(tabs)/accounts')} chevron />
          <Row icon="transfer" label="Transfer money" onPress={() => router.push('/account/transfer')} last chevron />
        </Group>

        <View style={{ marginTop: 24 }}>
          <Button title="Log out" variant="danger" icon="logout" onPress={() => setLogoutOpen(true)} />
        </View>

        <AppText size={11.5} color={colors.mutedSoft} style={{ textAlign: 'center', marginTop: 20 }}>
          MoneyMate · v1.0.0
        </AppText>
      </ScrollView>

      {/* Currency picker sheet */}
      <Sheet open={currencyOpen} onClose={() => setCurrencyOpen(false)} dismissable={!savingCurrency}>
        <AppText variant="heading" size={18} color={colors.heading} style={{ textAlign: 'center', marginBottom: 18 }}>
          Choose currency
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {POPULAR_CURRENCIES.map((c) => (
            <Pill key={c} label={`${c} ${currencySymbol(c)}`} active={user?.currency === c} onPress={() => !savingCurrency && pickCurrency(c)} />
          ))}
        </View>
      </Sheet>

      {/* Log out confirmation sheet */}
      <ConfirmSheet
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        icon="logout"
        title="Log out?"
        message="You'll need to sign in again to see your accounts and transactions."
        confirmLabel="Log out"
        loading={loggingOut}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  )
}

function GroupLabel({ children }: { children: string }) {
  const { colors } = useTheme()
  return (
    <AppText weight="bold" size={12} color={colors.mutedSoft} style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginLeft: 4, marginBottom: 10, marginTop: 6 }}>
      {children}
    </AppText>
  )
}

function Group({ children }: { children: React.ReactNode }) {
  return <View style={{ marginBottom: 18 }}>{children}</View>
}

function Row({
  icon,
  label,
  value,
  right,
  onPress,
  first,
  last,
  chevron,
}: {
  icon: IconName
  label: string
  value?: string
  right?: React.ReactNode
  onPress?: () => void
  first?: boolean
  last?: boolean
  chevron?: boolean
}) {
  const { colors, radii } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderTopWidth: first ? 1 : 0,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderTopLeftRadius: first ? radii.lg : 0,
        borderTopRightRadius: first ? radii.lg : 0,
        borderBottomLeftRadius: last ? radii.lg : 0,
        borderBottomRightRadius: last ? radii.lg : 0,
      }}
    >
      <View style={{ width: 38, height: 38, borderRadius: radii.md, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <AppText weight="semibold" size={14.5} color={colors.heading} style={{ flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText size={13} weight="semibold" color={colors.muted}>
          {value}
        </AppText>
      ) : null}
      {right}
      {chevron ? <Icon name="chevron-right" size={18} color={colors.tabInactive} /> : null}
    </Pressable>
  )
}
