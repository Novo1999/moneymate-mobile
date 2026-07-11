import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

type MaterialName = ComponentProps<typeof MaterialCommunityIcons>['name']

export type IconName =
  | 'home'
  | 'activity'
  | 'cards'
  | 'profile'
  | 'plus'
  | 'minus'
  | 'settings'
  | 'bell'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'filter'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'currency'
  | 'calendar'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'mail'
  | 'account'
  | 'transfer'
  | 'chart'
  | 'chart-pie'
  | 'target'
  | 'check'
  | 'close'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-up-right'
  | 'google'
  | 'moon'
  | 'wallet'
  | 'bank'
  | 'cash'
  | 'tag'
  | 'shield'
  | 'info'
  | 'camera'

const GLYPHS: Record<IconName, MaterialName> = {
  home: 'home-variant-outline',
  activity: 'swap-vertical',
  cards: 'credit-card-outline',
  profile: 'account-circle-outline',
  plus: 'plus',
  minus: 'minus',
  settings: 'cog-outline',
  bell: 'bell-outline',
  'chevron-down': 'chevron-down',
  'chevron-right': 'chevron-right',
  'chevron-left': 'chevron-left',
  search: 'magnify',
  filter: 'tune-variant',
  edit: 'pencil-outline',
  trash: 'trash-can-outline',
  logout: 'logout',
  currency: 'currency-usd',
  calendar: 'calendar-outline',
  eye: 'eye-outline',
  'eye-off': 'eye-off-outline',
  lock: 'lock-outline',
  mail: 'email-outline',
  account: 'account-outline',
  transfer: 'bank-transfer',
  chart: 'chart-line',
  'chart-pie': 'chart-donut',
  target: 'target',
  check: 'check',
  close: 'close',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'arrow-up-right': 'arrow-top-right',
  google: 'google',
  moon: 'weather-night',
  wallet: 'wallet-outline',
  bank: 'bank-outline',
  cash: 'cash',
  tag: 'tag-outline',
  shield: 'shield-check-outline',
  info: 'information-outline',
  camera: 'camera-outline',
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
}

export function Icon({ name, size = 18, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name={GLYPHS[name]} size={size} color={color} />
}
