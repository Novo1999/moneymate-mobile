import type { ExpenseCategory, IncomeCategory } from '@/constants/categories'

export type AccountType = {
  id: number
  name: string
  balance: string
}

export type TransactionKind = 'income' | 'expense'

export type Transaction = {
  id: number
  money: string
  note: string | null
  type: TransactionKind
  category: IncomeCategory | ExpenseCategory | string
  createdAt: string
}

export type TransactionInfo = {
  count: number
  transactions: Transaction[]
}

export type TransactionsPaginated = {
  transactions: Transaction[]
  nextCursor: number
  count: number
}

export type TransactionFilter = {
  category?: string
  type?: TransactionKind | ''
  money?: { min: number; max: number }
}

export type Category = {
  id?: number
  userId: number
  name: string
  type: TransactionKind
  icon: string
}

export type TransferPayload = {
  fromAccountId: number
  toAccountId: number
  amount: number
  note?: string
}
