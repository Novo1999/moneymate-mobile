import { ModalHeader } from '@/components/ModalHeader'
import { AppText, Button, Field, Segmented } from '@/components/ui'
import { addCategory } from '@/lib/api/category'
import { ApiError } from '@/lib/api/client'
import { dataVersionAtom } from '@/state/atoms'
import { useAuth } from '@/state/auth'
import { useTheme } from '@/theme/ThemeProvider'
import type { TransactionKind } from '@/types/models'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const EMOJIS = ['🍔', '🛍️', '🏠', '🚕', '🚗', '🎬', '📱', '🏦', '📈', '💊', '✈️', '☕', '🎮', '🎁', '💼', '🏆', '💹', '🐶', '📚', '💡']

export default function NewCategory() {
  const { colors, radii } = useTheme()
  const { back } = useRouter()
  const { user } = useAuth()
  const bumpData = useSetAtom(dataVersionAtom)

  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionKind>('expense')
  const [icon, setIcon] = useState(EMOJIS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    if (!name.trim()) return setError('Enter a category name')
    if (!user?.id) return setError('Not signed in')
    setSubmitting(true)
    try {
      await addCategory({ userId: user.id, name: name.trim(), type, icon })
      bumpData((v) => v + 1)
      back()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to add category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <ModalHeader title="New Category" />

        <View style={{ marginBottom: 20 }}>
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
          />
        </View>

        <Field label="Category name" icon="tag" placeholder="e.g. Groceries" value={name} onChangeText={setName} autoCapitalize="words" />

        <AppText weight="bold" size={13} color={colors.muted} style={{ marginTop: 20, marginBottom: 12, marginLeft: 2 }}>
          Icon
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {EMOJIS.map((e) => {
            const selected = icon === e
            // fluid cells: 4 per row, growing with screen width (kept square via aspectRatio)
            const tile = { width: '100%', aspectRatio: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' } as const
            return (
              <Pressable key={e} onPress={() => setIcon(e)} style={{ width: '21%', flexGrow: 1 }}>
                {selected ? (
                  <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tile}>
                    <AppText size={22}>{e}</AppText>
                  </LinearGradient>
                ) : (
                  <View style={[tile, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                    <AppText size={22}>{e}</AppText>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>

        {error ? (
          <View style={{ marginTop: 16, backgroundColor: colors.dangerSoftBg, borderRadius: radii.md, padding: 12, borderWidth: 1, borderColor: colors.dangerBorder }}>
            <AppText size={12.5} color={colors.danger} style={{ textAlign: 'center' }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button title="Create category" onPress={submit} loading={submitting} style={{ marginTop: 22 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
