import type { AccountType, TransferPayload } from '@/types/models'
import { apiClient, requireApiData } from './client'

export async function listAccounts(): Promise<AccountType[]> {
  const res = await apiClient<AccountType[]>('/accountType')
  return requireApiData(res, 'Failed to load accounts')
}

export async function getAccount(id: number): Promise<AccountType> {
  const res = await apiClient<AccountType>(`/accountType/${id}`)
  return requireApiData(res, 'Failed to load account')
}

export async function addAccount(payload: { name: string; balance?: number }): Promise<AccountType> {
  const res = await apiClient<AccountType>('/accountType/add', { method: 'POST', body: payload })
  return requireApiData(res, 'Failed to add account')
}

export async function editAccount(id: number, payload: { name: string }): Promise<void> {
  await apiClient(`/accountType/edit/${id}`, { method: 'PATCH', body: payload })
}

export async function transferBalance(payload: TransferPayload): Promise<void> {
  await apiClient('/accountType/transfer', { method: 'PATCH', body: payload })
}

export async function deleteAccount(id: number): Promise<void> {
  await apiClient(`/accountType/delete/${id}`, { method: 'DELETE' })
}
