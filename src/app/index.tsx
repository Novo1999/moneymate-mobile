import { Loader } from '@/components/ui/States'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/state/auth'
import { Redirect } from 'expo-router'

export default function Index() {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <Screen>
        <Loader />
      </Screen>
    )
  }

  return <Redirect href={status === 'authenticated' ? '/(tabs)' : '/auth'} />
}
