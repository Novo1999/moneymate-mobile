import type { Transaction } from '@/types/models'

export type CategorySlice = {
  category: string
  total: number
  pct: number
}

export function summarize(transactions: Transaction[]) {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    const amount = Number(t.money) || 0
    if (t.type === 'income') income += amount
    else expense += amount
  }
  return { income, expense, net: income - expense }
}

/** Expense totals grouped by category, sorted descending, with percentage of total expense. */
export function expenseByCategory(transactions: Transaction[]): CategorySlice[] {
  const totals = new Map<string, number>()
  let grand = 0
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const amount = Number(t.money) || 0
    totals.set(t.category, (totals.get(t.category) ?? 0) + amount)
    grand += amount
  }
  const slices = [...totals.entries()].map(([category, total]) => ({
    category,
    total,
    pct: grand > 0 ? total / grand : 0,
  }))
  return slices.sort((a, b) => b.total - a.total)
}
