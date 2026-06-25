import type { Category } from '@/types/models'
import { apiClient, requireApiData } from './client'

export async function listCategories(): Promise<Category[]> {
  const res = await apiClient<Category[]>('/categories')
  return requireApiData(res, 'Failed to load categories')
}

export async function addCategory(payload: Category): Promise<Category> {
  const res = await apiClient<Category>('/categories/add', { method: 'POST', body: payload })
  return requireApiData(res, 'Failed to add category')
}

export async function editCategory(id: number, payload: Partial<Category>): Promise<void> {
  await apiClient(`/categories/edit/${id}`, { method: 'PATCH', body: payload })
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient(`/categories/delete/${id}`, { method: 'DELETE' })
}
