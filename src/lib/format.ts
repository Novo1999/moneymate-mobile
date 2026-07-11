import { currencySymbol } from '@/constants/currency'
import { format, isToday, isYesterday } from 'date-fns'

// Hoisted: Intl formatters are expensive to construct, never create them per call/render.
const AMOUNT_FORMAT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "1,250.00" — grouped, 2dp, unsigned, no currency symbol. */
export function formatAmount(amount: number | string): string {
  const n = typeof amount === 'string' ? Number(amount) : amount
  const safe = Number.isFinite(n) ? n : 0
  return AMOUNT_FORMAT.format(Math.abs(safe))
}

/** "$1,250.00" / "-$1,250.00" — grouped, 2dp, sign preserved (balances can go negative). */
export function formatMoney(amount: number | string, currency?: string): string {
  const n = typeof amount === 'string' ? Number(amount) : amount
  const sign = Number.isFinite(n) && n < 0 ? '-' : ''
  return `${sign}${currencySymbol(currency)}${formatAmount(amount)}`
}

/** Signed money for transactions: "+$20.00" / "-$8.50". The kind decides the sign. */
export function formatSignedMoney(amount: number | string, kind: 'income' | 'expense', currency?: string): string {
  const sign = kind === 'income' ? '+' : '-'
  const n = typeof amount === 'string' ? Number(amount) : amount
  return `${sign}${formatMoney(Math.abs(Number.isFinite(n) ? n : 0), currency)}`
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
