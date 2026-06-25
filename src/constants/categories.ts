import type { IconName } from '@/components/Icon'
import type { TransactionKind } from '@/types/models'

// Mirrors the backend / web enums exactly (values are what the API stores).
export enum IncomeCategory {
  SALARY = 'salary',
  AWARDS = 'awards',
  GRANTS = 'grants',
  SALE = 'sale',
  RENTAL = 'rental',
  REFUNDS = 'refunds',
  COUPON = 'coupon',
  LOTTERY = 'lottery',
  GIFTS = 'gifts',
  INTERESTS = 'interests',
  OTHERS_INCOME = 'others_income',
  TRANSFER = 'transfer',
}

export enum ExpenseCategory {
  FOOD_DRINKS = 'food_drinks',
  SHOPPING = 'shopping',
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  VEHICLE = 'vehicle',
  LIFE_ENTERTAINMENT = 'life_entertainment',
  COMMUNICATION_PC = 'communication_pc',
  FINANCIAL_EXPENSES = 'financial_expenses',
  INVESTMENTS = 'investments',
  OTHERS_EXPENSE = 'others_expense',
  TRANSFER = 'transfer_income',
}

export const TRANSACTION_CATEGORY_LABEL: Record<string, string> = {
  // Expense
  food_drinks: 'Food & Drinks',
  shopping: 'Shopping',
  housing: 'Housing',
  transportation: 'Transportation',
  vehicle: 'Vehicle',
  life_entertainment: 'Life & Entertainment',
  communication_pc: 'Communication & PC',
  financial_expenses: 'Financial Expenses',
  investments: 'Investments',
  others_expense: 'Others',
  transfer_income: 'Transfer',
  // Income
  salary: 'Salary',
  awards: 'Awards',
  grants: 'Grants',
  sale: 'Sale',
  rental: 'Rental',
  refunds: 'Refunds',
  coupon: 'Coupon',
  lottery: 'Lottery',
  gifts: 'Gifts',
  interests: 'Interests',
  others_income: 'Others',
  transfer: 'Transfer',
}

// Emoji used in the round category avatars (cheerful, matches the design mockups).
export const CATEGORY_EMOJI: Record<string, string> = {
  food_drinks: '🍔',
  shopping: '🛍️',
  housing: '🏠',
  transportation: '🚕',
  vehicle: '🚗',
  life_entertainment: '🎬',
  communication_pc: '📱',
  financial_expenses: '🏦',
  investments: '📈',
  others_expense: '📦',
  transfer_income: '🔁',
  salary: '💼',
  awards: '🏆',
  grants: '🤝',
  sale: '🏷️',
  rental: '🏠',
  refunds: '🧾',
  coupon: '🎟️',
  lottery: '✨',
  gifts: '🎁',
  interests: '💹',
  others_income: '💰',
  transfer: '🔁',
}

const INCOME_ORDER = Object.values(IncomeCategory)
const EXPENSE_ORDER = Object.values(ExpenseCategory)

export function categoriesForKind(kind: TransactionKind): string[] {
  return kind === 'income' ? INCOME_ORDER : EXPENSE_ORDER
}

export function categoryLabel(value: string): string {
  return TRANSACTION_CATEGORY_LABEL[value] ?? value
}

export function categoryEmoji(value: string): string {
  return CATEGORY_EMOJI[value] ?? '💸'
}

// Fallback glyph for places that prefer a vector icon over emoji.
export function categoryIcon(value: string): IconName {
  if (value === 'transfer' || value === 'transfer_income') return 'transfer'
  return 'tag'
}
