import { currencySymbol } from '@/constants/currency'
import { format, isToday, isYesterday } from 'date-fns'

/** "$1,250.00" — grouped, 2dp. */
export function formatMoney(amount: number | string, currency?: string): string {
  const n = typeof amount === 'string' ? Number(amount) : amount
  const safe = Number.isFinite(n) ? n : 0
  const grouped = Math.abs(safe).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currencySymbol(currency)}${grouped}`
}

/** Signed money for transactions: "+$20.00" / "-$8.50". */
export function formatSignedMoney(amount: number | string, kind: 'income' | 'expense', currency?: string): string {
  const sign = kind === 'income' ? '+' : '-'
  return `${sign}${formatMoney(amount, currency)}`
}

/** Compact balance for hero cards: keeps cents but groups thousands. */
export function formatBalance(amount: number | string, currency?: string): string {
  return formatMoney(amount, currency)
}

export function formatTxDate(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return `Today · ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday · ${format(d, 'h:mm a')}`
  return format(d, 'd MMM · h:mm a')
}

export function dayGroupLabel(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEEE, d MMMM')
}

export function dayKey(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd')
}
