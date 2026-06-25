import type { Transaction, TransactionFilter, TransactionInfo, TransactionsPaginated } from '@/types/models'
import { apiClient, requireApiData } from './client'
import { withQuery } from './query'

/**
 * Dashboard data source. Note: due to backend route ordering, `/transaction/info`
 * resolves to the same handler as `/transaction/user` and returns { transactions, count },
 * which is exactly what the web app consumes.
 */
export async function getTransactionInfo(accountTypeId: number, from: string, to: string): Promise<TransactionInfo> {
  const res = await apiClient<TransactionInfo>(withQuery('/transaction/info', { accountTypeId, from, to }))
  return requireApiData(res, 'Failed to load transactions')
}

export async function getTransactionsPaginated(
  accountTypeId: number,
  cursor: number,
  limit: number,
  filter?: TransactionFilter,
): Promise<TransactionsPaginated> {
  const res = await apiClient<TransactionsPaginated>(
    withQuery('/transaction/paginated', {
      accountTypeId,
      limit,
      cursor: cursor || undefined,
      category: filter?.category || undefined,
      type: filter?.type || undefined,
      minMoney: filter?.money?.min || undefined,
      maxMoney: filter?.money?.max || undefined,
    }),
  )
  return requireApiData(res, 'Failed to load transactions')
}

export async function getMaxAmount(accountTypeId: number): Promise<number> {
  const res = await apiClient<{ maxAmount: number }>(withQuery('/transaction/amount-range', { accountTypeId }))
  return requireApiData(res, 'Failed to load amount range').maxAmount
}

export type AddTransactionInput = {
  category: string
  money: number
  type: 'income' | 'expense'
  userId: number
  accountTypeId: number
  createdAt?: string
  note?: string
}

export async function addTransaction(input: AddTransactionInput): Promise<Transaction> {
  const res = await apiClient<Transaction>('/transaction/add', { method: 'POST', body: input })
  return requireApiData(res, 'Failed to add transaction')
}

export type EditTransactionInput = Partial<{
  category: string
  money: number
  type: 'income' | 'expense'
  createdAt: string
  note: string
}>

export async function editTransaction(id: number, input: EditTransactionInput): Promise<void> {
  await apiClient(`/transaction/edit/${id}`, { method: 'PATCH', body: input })
}

export async function deleteTransaction(id: number): Promise<void> {
  await apiClient(`/transaction/delete/${id}`, { method: 'DELETE' })
}
