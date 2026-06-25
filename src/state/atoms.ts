import type { AuthStatus, User } from '@/types/auth'
import type { Transaction, TransactionFilter } from '@/types/models'
import { atom } from 'jotai'

export const userAtom = atom<User | null>(null)
export const authStatusAtom = atom<AuthStatus>('loading')

/** Currently selected account (account type) used across the dashboard & transactions. */
export const activeAccountIdAtom = atom<number | null>(null)

/** Bump to force data-dependent screens to refetch (after add/edit/delete/transfer). */
export const dataVersionAtom = atom(0)

/** Transaction list filters (Transactions tab). */
export const txFilterAtom = atom<TransactionFilter>({ category: '', type: '', money: { min: 0, max: 0 } })

/** The transaction handed to the edit modal (the backend has no single-transaction GET). */
export const editingTransactionAtom = atom<Transaction | null>(null)
